#!/usr/bin/env node
/**
 * Build script for KeywordTracker.
 * Replaces the old `zpl build` command from zerespluginlibrary.
 * Reads config.json, generates the BetterDiscord @META header, bundles
 * CSS/SVG assets inline, and writes release/KeywordTracker.plugin.js.
 */

const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..");
const pluginName = "KeywordTracker";
const pluginDir = path.join(projectRoot, pluginName);
const releaseDir = path.join(projectRoot, "release");
const configPath = path.join(pluginDir, "config.json");

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

/**
 * Generates the BetterDiscord @META comment header from config.json.
 */
function buildMeta(config) {
    const info = config.info || config;
    const metaLines = ["/**"];
    const line = (label, val) => val && metaLines.push(` * @${label} ${val}`);
    line("name", info.name);
    line("description", info.description);
    line("version", info.version);
    const authorName = info.author ?? info.authors?.map(a => a.name).join(", ");
    const authorId = info.authorId ?? info.authors?.[0]?.id ?? info.authors?.[0]?.discord_id;
    line("author", authorName);
    line("authorId", authorId);
    line("authorLink", info.authorLink ?? info.authors?.[0]?.link);
    line("website", info.website ?? info.github);
    line("source", info.source ?? info.github_raw ?? info.github);
    metaLines.push(" */\n");
    return metaLines.join("\n");
}

/**
 * Replaces require('file.css') / require('file.svg') etc. with the file
 * contents embedded as a template literal, so the built plugin is a single file.
 */
function bundle(content, baseDir, mainFile) {
    const files = fs.readdirSync(baseDir).filter(f => f !== "config.json" && f !== mainFile);
    for (const fileName of files) {
        const escaped = fileName.replace(/[.+*?^${}()|[\]\\]/g, "\\$&");
        content = content.replace(
            new RegExp(`require\\(('|"|\`)${escaped}('|"|\`)\\)`, "g"),
            () => {
                const raw = fs.readFileSync(path.join(baseDir, fileName), "utf8");
                // Escape in the correct order so the content is safe inside a
                // template literal: backslashes first, then interpolation
                // delimiters, then backticks.
                const safe = raw
                    .replace(/\\/g, "\\\\")
                    .replace(/\$\{/g, "\\${")
                    .replace(/`/g, "\\`");
                return `\`${safe}\``;
            }
        );
    }
    return content;
}

if (!fs.existsSync(releaseDir)) fs.mkdirSync(releaseDir, { recursive: true });

const mainFile = config.main || "index.js";
const mainFilePath = path.join(pluginDir, mainFile);

let content = fs.readFileSync(mainFilePath, "utf8");
content = bundle(content, pluginDir, mainFile);

const result = buildMeta(config) + content;
const outPath = path.join(releaseDir, `${pluginName}.plugin.js`);
fs.writeFileSync(outPath, result, "utf8");
console.log(`Built ${pluginName} → ${outPath}`);
