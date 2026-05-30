import http from "node:http";
import net from "node:net";
import crypto from "node:crypto";
import { URL } from "node:url";
import { buildClearScript, buildInjectScript } from "./theme-script.js";
import { imageFileToDataUri } from "./image.js";
import { addRegistration, loadState, saveState } from "./state.js";

function httpJson(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`GET ${url} returned HTTP ${res.statusCode}`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(new Error(`GET ${url} returned invalid JSON: ${error.message}`));
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(4000, () => {
      req.destroy(new Error(`GET ${url} timed out`));
    });
  });
}

export async function listPages(port = 9222) {
  return httpJson(`http://127.0.0.1:${port}/json/list`);
}

export function pickMainPage(pages) {
  const strict = pages.find((page) => {
    const url = String(page.url || "");
    return page.type === "page" && url.includes("index.html") && !url.includes("avatar-overlay") && page.webSocketDebuggerUrl;
  });
  if (strict) return strict;
  return pages.find((page) => page.type === "page" && page.webSocketDebuggerUrl) || null;
}

export async function locateMainPage(port = 9222) {
  const pages = await listPages(port);
  const page = pickMainPage(pages);
  if (!page) {
    throw new Error(`No CDP page target found on port ${port}. Start Codex Desktop with --remote-debugging-port=${port}.`);
  }
  return page;
}

class CdpSocket {
  constructor(wsUrl) {
    this.url = new URL(wsUrl);
    this.socket = null;
    this.buffer = Buffer.alloc(0);
    this.nextId = 1;
    this.pendingMessages = [];
    this.waiters = [];
  }

  async connect() {
    if (this.url.protocol !== "ws:") {
      throw new Error(`Only ws:// CDP URLs are supported, got ${this.url.protocol}`);
    }
    const key = crypto.randomBytes(16).toString("base64");
    const port = Number(this.url.port || 80);
    const path = `${this.url.pathname}${this.url.search}`;

    this.socket = net.createConnection({ host: this.url.hostname, port });
    await new Promise((resolve, reject) => {
      const onError = (error) => {
        cleanup();
        reject(error);
      };
      const onConnect = () => {
        const request = [
          `GET ${path} HTTP/1.1`,
          `Host: ${this.url.host}`,
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Key: ${key}`,
          "Sec-WebSocket-Version: 13",
          "\r\n"
        ].join("\r\n");
        this.socket.write(request);
      };
      const onData = (chunk) => {
        this.buffer = Buffer.concat([this.buffer, chunk]);
        const marker = this.buffer.indexOf("\r\n\r\n");
        if (marker === -1) return;
        const header = this.buffer.slice(0, marker).toString("utf8");
        this.buffer = this.buffer.slice(marker + 4);
        if (!header.startsWith("HTTP/1.1 101") && !header.startsWith("HTTP/1.0 101")) {
          cleanup();
          reject(new Error(`WebSocket upgrade failed: ${header.split("\r\n")[0]}`));
          return;
        }
        cleanup();
        this.socket.on("data", (next) => this.onData(next));
        this.socket.on("error", (error) => this.rejectWaiters(error));
        this.socket.on("close", () => this.rejectWaiters(new Error("CDP WebSocket closed")));
        if (this.buffer.length) this.parseFrames();
        resolve();
      };
      const cleanup = () => {
        this.socket.off("error", onError);
        this.socket.off("connect", onConnect);
        this.socket.off("data", onData);
      };
      this.socket.once("error", onError);
      this.socket.once("connect", onConnect);
      this.socket.on("data", onData);
    });
  }

  onData(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    this.parseFrames();
  }

  parseFrames() {
    while (this.buffer.length >= 2) {
      const first = this.buffer[0];
      const second = this.buffer[1];
      const opcode = first & 0x0f;
      let offset = 2;
      let length = second & 0x7f;
      if (length === 126) {
        if (this.buffer.length < offset + 2) return;
        length = this.buffer.readUInt16BE(offset);
        offset += 2;
      } else if (length === 127) {
        if (this.buffer.length < offset + 8) return;
        const high = this.buffer.readUInt32BE(offset);
        const low = this.buffer.readUInt32BE(offset + 4);
        length = high * 2 ** 32 + low;
        offset += 8;
      }
      const masked = Boolean(second & 0x80);
      let mask;
      if (masked) {
        if (this.buffer.length < offset + 4) return;
        mask = this.buffer.slice(offset, offset + 4);
        offset += 4;
      }
      if (this.buffer.length < offset + length) return;
      let payload = this.buffer.slice(offset, offset + length);
      this.buffer = this.buffer.slice(offset + length);
      if (masked) {
        payload = Buffer.from(payload.map((byte, index) => byte ^ mask[index % 4]));
      }
      if (opcode === 8) {
        this.rejectWaiters(new Error("CDP WebSocket closed by remote"));
        return;
      }
      if (opcode !== 1) continue;
      try {
        this.pushMessage(JSON.parse(payload.toString("utf8")));
      } catch {
        // Ignore malformed text frames from the remote endpoint.
      }
    }
  }

  pushMessage(message) {
    const waiter = this.waiters.shift();
    if (waiter) {
      waiter.resolve(message);
    } else {
      this.pendingMessages.push(message);
    }
  }

  rejectWaiters(error) {
    for (const waiter of this.waiters.splice(0)) {
      waiter.reject(error);
    }
  }

  nextMessage(timeoutMs = 8000) {
    if (this.pendingMessages.length) {
      return Promise.resolve(this.pendingMessages.shift());
    }
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const index = this.waiters.findIndex((waiter) => waiter.resolve === resolve);
        if (index >= 0) this.waiters.splice(index, 1);
        reject(new Error("Timed out waiting for CDP response"));
      }, timeoutMs);
      this.waiters.push({
        resolve: (message) => {
          clearTimeout(timer);
          resolve(message);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        }
      });
    });
  }

  sendFrame(text) {
    const payload = Buffer.from(text, "utf8");
    let header;
    if (payload.length < 126) {
      header = Buffer.alloc(2);
      header[1] = 0x80 | payload.length;
    } else if (payload.length < 65536) {
      header = Buffer.alloc(4);
      header[1] = 0x80 | 126;
      header.writeUInt16BE(payload.length, 2);
    } else {
      header = Buffer.alloc(10);
      header[1] = 0x80 | 127;
      header.writeUInt32BE(0, 2);
      header.writeUInt32BE(payload.length, 6);
    }
    header[0] = 0x81;
    const mask = crypto.randomBytes(4);
    const masked = Buffer.alloc(payload.length);
    for (let i = 0; i < payload.length; i += 1) {
      masked[i] = payload[i] ^ mask[i % 4];
    }
    this.socket.write(Buffer.concat([header, mask, masked]));
  }

  async command(method, params = {}, timeoutMs = 8000) {
    const id = this.nextId++;
    this.sendFrame(JSON.stringify({ id, method, params }));
    while (true) {
      const message = await this.nextMessage(timeoutMs);
      if (message.id !== id) continue;
      if (message.error) {
        throw new Error(`CDP ${method} failed: ${JSON.stringify(message.error)}`);
      }
      if (message.result && message.result.exceptionDetails) {
        throw new Error(`CDP ${method} exception: ${JSON.stringify(message.result.exceptionDetails)}`);
      }
      return message.result || {};
    }
  }

  close() {
    if (!this.socket) return;
    this.socket.end();
  }
}

async function withCdpPage(port, callback) {
  const page = await locateMainPage(port);
  const cdp = new CdpSocket(page.webSocketDebuggerUrl);
  await cdp.connect();
  try {
    return await callback(cdp, page);
  } finally {
    cdp.close();
  }
}

export async function status(port = 9222) {
  const pages = await listPages(port);
  const page = pickMainPage(pages);
  return {
    port,
    pageCount: pages.length,
    mainPage: page
      ? { id: page.id, title: page.title, url: page.url, websocket: page.webSocketDebuggerUrl }
      : null
  };
}

export async function applyBackground({ imagePath, port = 9222, themeOptions = {}, persist = true, forceLarge = false }) {
  const image = await imageFileToDataUri(imagePath, { forceLarge });
  const script = buildInjectScript(image.dataUri, themeOptions);
  return withCdpPage(port, async (cdp, page) => {
    await cdp.command("Page.enable");
    let identifier = null;
    if (persist) {
      const result = await cdp.command("Page.addScriptToEvaluateOnNewDocument", { source: script });
      identifier = result.identifier || null;
      if (identifier) {
        await addRegistration(identifier, {
          pageId: page.id,
          port,
          imagePath: image.absolutePath
        });
      }
    }
    await cdp.command("Runtime.evaluate", { expression: script, returnByValue: true });
    return {
      pageId: page.id,
      imagePath: image.absolutePath,
      imageBytes: image.byteLength,
      persisted: Boolean(identifier),
      identifier
    };
  });
}

export async function clearBackground({ port = 9222 } = {}) {
  const state = await loadState();
  const registrations = state.registrations;
  return withCdpPage(port, async (cdp) => {
    await cdp.command("Page.enable");
    const removed = [];
    const failed = [];
    for (const registration of registrations) {
      try {
        await cdp.command("Page.removeScriptToEvaluateOnNewDocument", {
          identifier: registration.identifier
        });
        removed.push(registration.identifier);
      } catch (error) {
        failed.push({ identifier: registration.identifier, error: error.message });
      }
    }
    const removedIdentifiers = new Set(removed);
    const remainingRegistrations = registrations.filter(
      (registration) => !removedIdentifiers.has(registration.identifier)
    );
    if (registrations.length > 0 || state.lastImage) {
      await saveState({ ...state, registrations: remainingRegistrations });
    }

    let currentStyleCleared = false;
    let currentStyleClearError = null;
    try {
      await cdp.command("Runtime.evaluate", {
        expression: buildClearScript(),
        returnByValue: true
      });
      currentStyleCleared = true;
    } catch (error) {
      currentStyleClearError = error.message;
    }
    return {
      removed,
      failed,
      remainingRegistrations: remainingRegistrations.length,
      currentStyleCleared,
      currentStyleClearError
    };
  });
}

export function buildDryRunScript(dataUri, options) {
  return buildInjectScript(dataUri, options);
}
