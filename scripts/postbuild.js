#!/usr/bin/env node
/**
 * Post-build script — no longer needed.
 *
 * This script previously patched the ZeresPluginLibrary-generated output to
 * replace the deprecated BdApi.showConfirmationModal() call with the modern
 * BdApi.UI.showConfirmationModal(). Now that the project has been migrated to
 * a native-BdApi build (scripts/build.js), the plugin source already uses the
 * correct API directly, so no patching is required.
 */
