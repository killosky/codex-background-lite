import test from "node:test";
import assert from "node:assert/strict";
import { buildClearScript, buildInjectScript, normalizeThemeOptions } from "../src/theme-script.js";
import { guessMimeType } from "../src/image.js";

test("normalizeThemeOptions clamps numeric values and keeps valid options", () => {
  assert.deepEqual(normalizeThemeOptions({
    overlayOpacity: 3,
    panelOpacity: -1,
    blur: 99,
    fit: "contain",
    position: "left 20%",
    accent: "#abcdef"
  }), {
    overlayOpacity: 0.9,
    panelOpacity: 0.05,
    blur: 32,
    fit: "contain",
    position: "left 20%",
    accent: "#abcdef"
  });
});

test("normalizeThemeOptions rejects unsafe CSS-ish input", () => {
  const options = normalizeThemeOptions({
    fit: "url(http://example.test)",
    position: "center; color:red",
    accent: "red"
  });

  assert.equal(options.fit, "cover");
  assert.equal(options.position, "center top");
  assert.equal(options.accent, "#7dd3fc");
});

test("buildInjectScript includes the managed style marker and supplied image data", () => {
  const script = buildInjectScript("data:image/png;base64,abc", {
    overlayOpacity: 0.3,
    panelOpacity: 0.7,
    blur: 4,
    accent: "#123456"
  });

  assert.match(script, /codex-background-lite-style/);
  assert.match(script, /data:image\/png;base64,abc/);
  assert.match(script, /#123456/);
});

test("buildClearScript removes the managed style marker", () => {
  assert.match(buildClearScript(), /codex-background-lite-style/);
  assert.match(buildClearScript(), /remove\(\)/);
});

test("guessMimeType supports only expected image extensions", () => {
  assert.equal(guessMimeType("a.JPG"), "image/jpeg");
  assert.equal(guessMimeType("a.png"), "image/png");
  assert.equal(guessMimeType("a.webp"), "image/webp");
  assert.throws(() => guessMimeType("a.gif"), /Unsupported image extension/);
});
