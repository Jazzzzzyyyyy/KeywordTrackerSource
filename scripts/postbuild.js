#!/usr/bin/env node
/**
 * Post-build script: patches the generated plugin file to use the current
 * BetterDiscord API.  The ZeresPluginLibrary build template still emits
 * `BdApi.showConfirmationModal(…)` but that top-level method was removed
 * from BdApi; it now lives at `BdApi.UI.showConfirmationModal(…)`.
 */

const fs = require("fs");
const path = require("path");

const pluginPath = path.join(__dirname, "..", "release", "KeywordTracker.plugin.js");

if (!fs.existsSync(pluginPath)) {
    console.error(`Could not find built plugin at ${pluginPath}`);
    process.exit(1);
}

let content = fs.readFileSync(pluginPath, "utf8");

const before = content;
// Replace deprecated top-level call with the modern namespaced one.
content = content.replace(/BdApi\.showConfirmationModal\(/g, "BdApi.UI.showConfirmationModal(");

if (content === before) {
    console.log("postbuild: nothing to patch (BdApi.showConfirmationModal not found).");
} else {
    fs.writeFileSync(pluginPath, content, "utf8");
    console.log("postbuild: patched BdApi.showConfirmationModal → BdApi.UI.showConfirmationModal");
}
