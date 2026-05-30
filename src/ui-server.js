import http from "node:http";
import { readFile } from "node:fs/promises";
import { applyBackground, buildDryRunScript, clearBackground, status } from "./cdp.js";
import { configFilePath, loadConfig, saveUploadedImage, updateConfig } from "./config.js";
import { imageFileToDataUri } from "./image.js";
import { renderUiPage } from "./ui-page.js";
import { loadState, stateFilePath } from "./state.js";

const JSON_LIMIT_BYTES = 18 * 1024 * 1024;

function sendJson(res, statusCode, data) {
  const body = `${JSON.stringify(data, null, 2)}\n`;
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(body);
}

function sendError(res, error, statusCode = 400) {
  sendJson(res, statusCode, { ok: false, error: error.message || String(error) });
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      size += Buffer.byteLength(chunk);
      if (size > JSON_LIMIT_BYTES) {
        reject(new Error("Request body is too large."));
        req.destroy();
        return;
      }
      body += chunk;
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error(`Invalid JSON body: ${error.message}`));
      }
    });
    req.on("error", reject);
  });
}

async function configPayload() {
  const [config, state] = await Promise.all([loadConfig(), loadState()]);
  return {
    ok: true,
    config,
    state: {
      registrationCount: state.registrations.length,
      lastImage: state.lastImage
    },
    paths: {
      config: configFilePath(),
      state: stateFilePath()
    }
  };
}

async function updateConfigFromBody(body) {
  let image;
  if (body.imageDataUri) {
    image = await saveUploadedImage(body.imageDataUri, body.imageName, {
      forceLarge: body.forceLarge === true
    });
  }
  await updateConfig({
    cdpPort: body.cdpPort,
    theme: body.theme,
    ...(image ? { image } : {})
  });
  return configPayload();
}

async function configuredImageAndTheme() {
  const config = await loadConfig();
  if (!config.image || !config.image.path) {
    throw new Error("Choose and save an image before running this action.");
  }
  return config;
}

async function routeApi(req, res, pathname) {
  if (req.method === "GET" && pathname === "/api/config") {
    sendJson(res, 200, await configPayload());
    return;
  }

  if (req.method === "GET" && pathname === "/api/image") {
    const config = await loadConfig();
    if (!config.image || !config.image.path) {
      sendError(res, new Error("No image is configured."), 404);
      return;
    }
    const bytes = await readFile(config.image.path);
    res.writeHead(200, {
      "content-type": config.image.mime,
      "cache-control": "no-store"
    });
    res.end(bytes);
    return;
  }

  if (req.method !== "POST") {
    sendError(res, new Error("Method not allowed."), 405);
    return;
  }

  const body = await readJsonBody(req);
  if (pathname === "/api/config") {
    sendJson(res, 200, await updateConfigFromBody(body));
    return;
  }

  if (pathname === "/api/dry-run") {
    const config = await configuredImageAndTheme();
    const image = await imageFileToDataUri(config.image.path, { forceLarge: true });
    const script = buildDryRunScript(image.dataUri, config.theme);
    sendJson(res, 200, {
      ok: true,
      mode: "dry-run",
      imagePath: image.absolutePath,
      imageBytes: image.byteLength,
      scriptBytes: Buffer.byteLength(script, "utf8")
    });
    return;
  }

  if (pathname === "/api/status") {
    const config = await loadConfig();
    sendJson(res, 200, { ok: true, result: await status(config.cdpPort) });
    return;
  }

  if (pathname === "/api/apply-preview" || pathname === "/api/apply-persistent") {
    const config = await configuredImageAndTheme();
    const persist = pathname === "/api/apply-persistent";
    const result = await applyBackground({
      imagePath: config.image.path,
      port: config.cdpPort,
      themeOptions: config.theme,
      persist,
      forceLarge: true
    });
    sendJson(res, 200, { ok: true, persist, result });
    return;
  }

  if (pathname === "/api/clear") {
    const config = await loadConfig();
    sendJson(res, 200, { ok: true, result: await clearBackground({ port: config.cdpPort }) });
    return;
  }

  sendError(res, new Error("Not found."), 404);
}

function createServer() {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || "/", "http://127.0.0.1");
      if (req.method === "GET" && url.pathname === "/") {
        res.writeHead(200, {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
          "content-security-policy": "default-src 'self'; img-src 'self' data:; style-src 'unsafe-inline' 'self'; script-src 'unsafe-inline' 'self'; connect-src 'self'"
        });
        res.end(renderUiPage());
        return;
      }
      if (url.pathname.startsWith("/api/")) {
        await routeApi(req, res, url.pathname);
        return;
      }
      sendError(res, new Error("Not found."), 404);
    } catch (error) {
      if (!res.headersSent) {
        sendError(res, error, 400);
      } else {
        res.end();
      }
    }
  });
}

function listen(server, host, port) {
  return new Promise((resolve, reject) => {
    const onError = (error) => {
      cleanup();
      reject(error);
    };
    const onListening = () => {
      cleanup();
      resolve();
    };
    const cleanup = () => {
      server.off("error", onError);
      server.off("listening", onListening);
    };
    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(port, host);
  });
}

export async function startUiServer({ host = "127.0.0.1", uiPort = 17837 } = {}) {
  let lastError = null;
  for (let port = uiPort; port < uiPort + 20; port += 1) {
    const server = createServer();
    try {
      await listen(server, host, port);
      return {
        server,
        host,
        port,
        url: `http://${host}:${port}/`
      };
    } catch (error) {
      lastError = error;
      if (error.code !== "EADDRINUSE") throw error;
    }
  }
  throw lastError || new Error("No available UI port found.");
}
