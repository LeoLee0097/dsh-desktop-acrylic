// dsh-desktop-acrylic — browser half (client plugin bundle). GENERATED FILE:
// run `node scripts/build.mjs` to regenerate from src/client.tpl.js + src/theme.mjs.
//
// Loaded by dsh-client-modules and executed through the vendored cordis
// Loader's lazy-CJS module table (window.__ModuleLoader__.load). The factory
// body is plain CJS with require() resolved against the shell's module table,
// the same shape the shipped ui-* packages and dsh-catppuccin emit.
//
// Everything here works *through the theme runtime*:
//   1. two Tokyo Night skins (dark / day) are registered as ordinary themes,
//      so switching is the runtime's own preference switch;
//   2. a settings row offers 暗色 / 亮色 / 默认 plus global font options;
//   3. the acrylic chrome layer (sidebar, top bar, dock) is mounted only while
//      one of our themes is active; floating surfaces blur through the
//      `--dsw-menu-backdrop-filter` token each skin already carries;
//   4. the plugin reports its own state to the host route, so the result can be
//      verified without looking at the screen.
window.__ModuleLoader__.load({
	id: "dsh-desktop-acrylic",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _store = require("@deepseek-ai/dsh-client-store");

		//#region tokyo-night: generated data
		/** Skin catalog (from src/theme.mjs): [night, day]. */
		const SKINS = [
		  {
		    "id": "tokyo-night",
		    "name": "Tokyo Night 暗色",
		    "colorScheme": "dark",
		    "tokens": {
		      "--dsw-static-neutral-50": "#c0caf5",
		      "--dsw-static-neutral-bluish-50": "#c0caf5",
		      "--dsw-static-neutral-100": "#a9b1d6",
		      "--dsw-static-neutral-bluish-100": "#a9b1d6",
		      "--dsw-static-neutral-200": "#9aa5ce",
		      "--dsw-static-neutral-bluish-200": "#9aa5ce",
		      "--dsw-static-neutral-300": "#737aa2",
		      "--dsw-static-neutral-bluish-300": "#737aa2",
		      "--dsw-static-neutral-400": "#545c7e",
		      "--dsw-static-neutral-bluish-400": "#545c7e",
		      "--dsw-static-neutral-500": "#3b4261",
		      "--dsw-static-neutral-bluish-500": "#3b4261",
		      "--dsw-static-neutral-600": "#2f334d",
		      "--dsw-static-neutral-bluish-600": "#2f334d",
		      "--dsw-static-neutral-700": "#292e42",
		      "--dsw-static-neutral-bluish-700": "#292e42",
		      "--dsw-static-neutral-800": "#1f2335",
		      "--dsw-static-neutral-bluish-800": "#1f2335",
		      "--dsw-static-neutral-850": "#1a1b26",
		      "--dsw-static-neutral-bluish-850": "#1a1b26",
		      "--dsw-static-neutral-900": "#16161e",
		      "--dsw-static-neutral-bluish-900": "#16161e",
		      "--dsw-static-neutral-950": "#12131a",
		      "--dsw-static-neutral-bluish-950": "#12131a",
		      "--dsw-static-neutral-1000": "#0b0b12",
		      "--dsw-static-neutral-bluish-1000": "#0b0b12",
		      "--dsw-static-neutral-00": "#c0caf5",
		      "--dsw-static-neutral-bluish-00": "#c0caf5",
		      "--dsw-static-deepseek-50": "color-mix(in srgb, #7aa2f7 45%, #c0caf5)",
		      "--dsw-static-deepseek-100": "color-mix(in srgb, #7aa2f7 30%, #c0caf5)",
		      "--dsw-static-deepseek-200": "color-mix(in srgb, #7aa2f7 70%, #c0caf5)",
		      "--dsw-static-deepseek-300": "color-mix(in srgb, #7dcfff 60%, #1a1b26)",
		      "--dsw-static-deepseek-400": "#7aa2f7",
		      "--dsw-static-deepseek-450": "#7aa2f7",
		      "--dsw-static-deepseek-500": "#7aa2f7",
		      "--dsw-static-deepseek-600": "color-mix(in srgb, #3d59a1 70%, #1a1b26)",
		      "--dsw-static-deepseek-700": "color-mix(in srgb, #3d59a1 60%, #1a1b26)",
		      "--dsw-static-deepseek-800": "color-mix(in srgb, #7aa2f7 35%, #16161e)",
		      "--dsw-static-deepseek-900": "color-mix(in srgb, #7aa2f7 22%, #16161e)",
		      "--dsw-static-blue-50": "color-mix(in srgb, #7aa2f7 45%, #c0caf5)",
		      "--dsw-static-blue-75": "color-mix(in srgb, #7aa2f7 32%, #c0caf5)",
		      "--dsw-static-blue-100": "color-mix(in srgb, #7aa2f7 24%, #c0caf5)",
		      "--dsw-static-blue-300": "color-mix(in srgb, #7aa2f7 62%, #1a1b26)",
		      "--dsw-static-blue-400": "color-mix(in srgb, #7aa2f7 82%, #1a1b26)",
		      "--dsw-static-blue-450": "#7aa2f7",
		      "--dsw-static-blue-500": "#7aa2f7",
		      "--dsw-static-blue-600": "color-mix(in srgb, #3d59a1 72%, #1a1b26)",
		      "--dsw-static-blue-800": "color-mix(in srgb, #3d59a1 55%, #16161e)",
		      "--dsw-static-blue-900": "color-mix(in srgb, #7aa2f7 30%, #16161e)",
		      "--dsw-static-blue-950": "color-mix(in srgb, #7aa2f7 20%, #16161e)",
		      "--dsw-static-blue-50p": "color-mix(in srgb, #7aa2f7 40%, #c0caf5)",
		      "--dsw-static-green-100": "color-mix(in srgb, #9ece6a 28%, #c0caf5)",
		      "--dsw-static-green-400": "color-mix(in srgb, #9ece6a 72%, #1a1b26)",
		      "--dsw-static-green-500": "#9ece6a",
		      "--dsw-static-green-900": "color-mix(in srgb, #9ece6a 32%, #16161e)",
		      "--dsw-static-red-50": "color-mix(in srgb, #f7768e 40%, #c0caf5)",
		      "--dsw-static-red-100": "color-mix(in srgb, #f7768e 26%, #c0caf5)",
		      "--dsw-static-red-400": "color-mix(in srgb, #f7768e 74%, #1a1b26)",
		      "--dsw-static-red-500": "#f7768e",
		      "--dsw-static-red-600": "color-mix(in srgb, #f7768e 66%, #16161e)",
		      "--dsw-static-red-900": "color-mix(in srgb, #f7768e 32%, #16161e)",
		      "--dsw-static-amber-100": "color-mix(in srgb, #e0af68 28%, #c0caf5)",
		      "--dsw-static-amber-400": "color-mix(in srgb, #e0af68 82%, #1a1b26)",
		      "--dsw-static-amber-500": "#ff9e64",
		      "--dsw-static-amber-600": "#ff9e64",
		      "--dsw-static-amber-900": "color-mix(in srgb, #ff9e64 38%, #16161e)",
		      "--dsw-alias-bg-base": "rgba(22, 22, 30, 0.1)",
		      "--dsw-alias-bg-layer-1": "rgba(15, 16, 23, 0.08)",
		      "--dsw-alias-bg-layer-2": "rgba(41, 46, 66, 0.18)",
		      "--dsw-alias-bg-layer-3": "rgba(52, 59, 88, 0.24)",
		      "--dsw-alias-bg-overlay": "rgba(26, 27, 38, 0.6)",
		      "--dsw-specific-sidebar-fill": "rgba(15, 16, 23, 0.1)",
		      "--dsw-specific-sidebar-nav-item-hover": "rgba(41, 46, 66, 0.28)",
		      "--dsw-specific-sidebar-nav-item-active": "rgba(41, 46, 66, 0.44)",
		      "--dsw-specific-input-major": "rgba(22, 22, 30, 0.26)",
		      "--dsw-specific-login-input": "rgba(22, 22, 30, 0.26)",
		      "--dsw-specific-selector": "rgba(41, 46, 66, 0.46)",
		      "--dsw-specific-bubble": "rgba(41, 46, 66, 0.34)",
		      "--dsw-specific-bubble-highlight": "rgba(52, 59, 88, 0.42)",
		      "--dsw-alias-bg-module-platform": "rgba(41, 46, 66, 0.34)",
		      "--dsw-alias-bg-multi-select": "rgba(41, 46, 66, 0.34)",
		      "--dsw-alias-bg-skeleton": "rgba(52, 59, 88, 0.08)",
		      "--dsw-alias-markdown-code-block": "rgba(15, 16, 23, 0.44)",
		      "--dsw-alias-markdown-code-block-banner": "rgba(41, 46, 66, 0.44)",
		      "--dsw-alias-markdown-code-segment-selected": "rgba(41, 46, 66, 0.44)",
		      "--dsw-alias-markdown-code-segment-unselected": "rgba(15, 16, 23, 0.44)",
		      "--dsw-alias-markdown-citation": "rgba(41, 46, 66, 0.44)",
		      "--dsw-alias-markdown-inline-code": "rgba(41, 46, 66, 0.44)",
		      "--dsw-alias-markdown-placeholder": "rgba(41, 46, 66, 0.44)",
		      "--dsw-alias-markdown-tag": "rgba(41, 46, 66, 0.44)",
		      "--dsw-alias-button-elevated-fill": "rgba(41, 46, 66, 0.4)",
		      "--dsw-alias-button-primary-dimmed": "rgba(41, 46, 66, 0.42)",
		      "--dsw-alias-button-floating-fill": "rgba(41, 46, 66, 0.5)",
		      "--dsw-alias-button-floating-hover": "rgba(59, 66, 97, 0.56)",
		      "--dsw-alias-button-ghost-active-fill": "rgba(41, 46, 66, 0.4)",
		      "--dsw-alias-button-ghost-active-hover": "rgba(41, 46, 66, 0.52)",
		      "--dsw-alias-state-business-tertiary": "rgba(41, 46, 66, 0.4)",
		      "--dsw-alias-state-success-tertiary": "rgba(41, 46, 66, 0.4)",
		      "--dsw-alias-state-warn-tertiary": "rgba(41, 46, 66, 0.4)",
		      "--dsw-alias-interactive-bg-hover": "rgba(41, 46, 66, 0.3)",
		      "--dsw-alias-interactive-bg-active": "rgba(59, 66, 97, 0.4)",
		      "--dsw-alias-interactive-bg-hover-solid": "rgba(41, 46, 66, 0.52)",
		      "--dsw-alias-scrollbar-bg-l1": "rgba(41, 46, 66, 0.34)",
		      "--dsw-alias-scrollbar-bg-l2": "rgba(41, 46, 66, 0.44)",
		      "--dsw-alias-scrollbar-hover-l1": "rgba(59, 66, 97, 0.54)",
		      "--dsw-alias-scrollbar-hover-l2": "rgba(59, 66, 97, 0.54)",
		      "--dsw-specific-menu": "rgba(26, 27, 38, 0.62)",
		      "--dsw-specific-tip": "rgba(26, 27, 38, 0.56)",
		      "--dsw-alias-toast-bg": "rgba(26, 27, 38, 0.74)",
		      "--dsw-alias-tooltip-bg": "rgba(41, 46, 66, 0.8)",
		      "--dsw-alias-bg-mask-1": "rgba(11, 11, 18, 0.5)",
		      "--dsw-alias-bg-mask-2": "rgba(11, 11, 18, 0.2)",
		      "--dsw-alias-bg-mask-3": "rgba(11, 11, 18, 0.48)",
		      "--dwa-root-base": "transparent",
		      "--dwa-panel-fill": "rgba(22, 22, 30, 0.75)",
		      "--dwa-panel-blur": "30px",
		      "--dwa-menu-solid": "#1a1b26",
		      "--tv-color-text": "var(--dsw-alias-label-primary)",
		      "--tv-color-text-important": "var(--dsw-alias-label-primary)",
		      "--tv-color-text-control": "var(--dsw-alias-label-primary)",
		      "--tv-color-text-secondary": "var(--dsw-alias-label-secondary)",
		      "--tv-color-text-weaken": "var(--dsw-alias-label-tertiary)",
		      "--tv-color-text-placeholder": "var(--dsw-alias-label-tertiary)",
		      "--tv-color-text-disabled": "var(--dsw-alias-label-dimmed)",
		      "--tv-color-text-active": "var(--dsw-alias-brand-primary)",
		      "--tv-color-text-link": "var(--dsw-alias-brand-primary)",
		      "--tv-color-icon": "var(--dsw-alias-label-secondary)",
		      "--tv-color-bg-1": "var(--dsw-alias-bg-layer-1)",
		      "--tv-color-bg-2": "var(--dsw-alias-bg-layer-2)",
		      "--tv-color-bg-3": "var(--dsw-alias-bg-layer-2)",
		      "--tv-color-bg-gray-1": "var(--dsw-alias-bg-layer-2)",
		      "--tv-color-bg-header": "var(--dsw-alias-bg-layer-3)",
		      "--tv-color-bg-hover": "var(--dsw-alias-interactive-bg-hover)",
		      "--tv-color-bg-hover-1": "var(--dsw-alias-interactive-bg-hover)",
		      "--tv-color-bg-active-emphasize-light": "var(--dsw-alias-interactive-bg-hover-accent)",
		      "--tv-color-border": "var(--dsw-alias-border-l2)",
		      "--tv-color-border-divider": "var(--dsw-alias-border-l1)",
		      "--tv-color-border-divider-short": "var(--dsw-alias-border-l1)",
		      "--tv-color-error-text": "var(--dsw-alias-state-error-primary)",
		      "--dsw-desktop-window-tint": "color-mix(in srgb, #0b0b12 26%, transparent)",
		      "--dsw-menu-backdrop-filter": "blur(24px) saturate(1.15)",
		      "--dsw-alias-border-l1": "rgba(84, 92, 126, 0.2)",
		      "--dsw-alias-border-l2": "rgba(84, 92, 126, 0.34)",
		      "--dsw-alias-border-l3": "rgba(84, 92, 126, 0.46)",
		      "--dsw-alias-border-l4": "rgba(84, 92, 126, 0.6)",
		      "--dsw-alias-label-primary": "#c0caf5",
		      "--dsw-alias-label-secondary": "#a9b1d6",
		      "--dsw-alias-label-tertiary": "#9aa5ce",
		      "--dsw-alias-label-caption": "#737aa2",
		      "--dsw-alias-label-dimmed": "#565f89",
		      "--dsw-alias-brand-primary": "#7aa2f7",
		      "--dsw-alias-brand-text": "#1a1b26",
		      "--dsw-alias-button-primary-fill": "#7aa2f7",
		      "--dsw-alias-button-primary-hover": "#7dcfff",
		      "--dsw-alias-button-ghost-active-border": "#3b4261",
		      "--dsw-alias-state-business-primary": "#7aa2f7",
		      "--dsw-alias-state-error-primary": "#f7768e",
		      "--dsw-alias-state-error-secondary": "#f7768e",
		      "--dsw-alias-state-success-primary": "#9ece6a",
		      "--dsw-alias-state-success-secondary": "#9ece6a",
		      "--dsw-alias-state-warn-label": "#e0af68",
		      "--dsw-alias-state-warn-primary": "#e0af68",
		      "--dsw-alias-state-warn-secondary": "#e0af68",
		      "--dsw-alias-interactive-bg-hover-accent": "rgba(122, 162, 247, 0.14)",
		      "--dsw-alias-interactive-bg-hover-danger": "rgba(247, 118, 142, 0.14)",
		      "--dsw-alias-separator-primary": "rgba(122, 162, 247, 0.5)",
		      "--shiki-foreground": "#c0caf5",
		      "--shiki-background": "rgba(15, 16, 23, 0.44)",
		      "--shiki-token-constant": "#ff9e64",
		      "--shiki-token-string": "#9ece6a",
		      "--shiki-token-comment": "#565f89",
		      "--shiki-token-keyword": "#bb9af7",
		      "--shiki-token-parameter": "#f7768e",
		      "--shiki-token-function": "#7aa2f7",
		      "--shiki-token-string-expression": "#9ece6a",
		      "--shiki-token-punctuation": "#a9b1d6",
		      "--shiki-token-link": "#7aa2f7",
		      "--shiki-token-inserted": "#9ece6a",
		      "--shiki-token-deleted": "#f7768e",
		      "--shiki-token-changed": "#e0af68"
		    }
		  },
		  {
		    "id": "tokyo-night-day",
		    "name": "Tokyo Night 亮色",
		    "colorScheme": "light",
		    "tokens": {
		      "--dsw-static-neutral-50": "#fbfcfe",
		      "--dsw-static-neutral-bluish-50": "#fbfcfe",
		      "--dsw-static-neutral-100": "#f6f7fb",
		      "--dsw-static-neutral-bluish-100": "#f6f7fb",
		      "--dsw-static-neutral-200": "#eff1f6",
		      "--dsw-static-neutral-bluish-200": "#eff1f6",
		      "--dsw-static-neutral-300": "#e5e8f2",
		      "--dsw-static-neutral-bluish-300": "#e5e8f2",
		      "--dsw-static-neutral-400": "#d5d9e7",
		      "--dsw-static-neutral-bluish-400": "#d5d9e7",
		      "--dsw-static-neutral-500": "#c0c4d8",
		      "--dsw-static-neutral-bluish-500": "#c0c4d8",
		      "--dsw-static-neutral-600": "#7d84a8",
		      "--dsw-static-neutral-bluish-600": "#7d84a8",
		      "--dsw-static-neutral-700": "#8b93b8",
		      "--dsw-static-neutral-bluish-700": "#8b93b8",
		      "--dsw-static-neutral-800": "#4d5b8b",
		      "--dsw-static-neutral-bluish-800": "#4d5b8b",
		      "--dsw-static-neutral-850": "#5d6c9c",
		      "--dsw-static-neutral-bluish-850": "#5d6c9c",
		      "--dsw-static-neutral-900": "#33477a",
		      "--dsw-static-neutral-bluish-900": "#33477a",
		      "--dsw-static-neutral-950": "color-mix(in srgb, #33477a 80%, #000000)",
		      "--dsw-static-neutral-bluish-950": "color-mix(in srgb, #33477a 80%, #000000)",
		      "--dsw-static-neutral-1000": "color-mix(in srgb, #33477a 65%, #000000)",
		      "--dsw-static-neutral-bluish-1000": "color-mix(in srgb, #33477a 65%, #000000)",
		      "--dsw-static-neutral-00": "#ffffff",
		      "--dsw-static-neutral-bluish-00": "#ffffff",
		      "--dsw-static-deepseek-50": "color-mix(in srgb, #5b8ede 45%, #33477a)",
		      "--dsw-static-deepseek-100": "color-mix(in srgb, #5b8ede 30%, #33477a)",
		      "--dsw-static-deepseek-200": "color-mix(in srgb, #5b8ede 70%, #33477a)",
		      "--dsw-static-deepseek-300": "color-mix(in srgb, #3a8ba8 60%, #eff1f6)",
		      "--dsw-static-deepseek-400": "#5b8ede",
		      "--dsw-static-deepseek-450": "#5b8ede",
		      "--dsw-static-deepseek-500": "#5b8ede",
		      "--dsw-static-deepseek-600": "color-mix(in srgb, #3f6bb5 70%, #eff1f6)",
		      "--dsw-static-deepseek-700": "color-mix(in srgb, #3f6bb5 60%, #eff1f6)",
		      "--dsw-static-deepseek-800": "color-mix(in srgb, #5b8ede 35%, #eef0f5)",
		      "--dsw-static-deepseek-900": "color-mix(in srgb, #5b8ede 22%, #eef0f5)",
		      "--dsw-static-blue-50": "color-mix(in srgb, #5b8ede 45%, #33477a)",
		      "--dsw-static-blue-75": "color-mix(in srgb, #5b8ede 32%, #33477a)",
		      "--dsw-static-blue-100": "color-mix(in srgb, #5b8ede 24%, #33477a)",
		      "--dsw-static-blue-300": "color-mix(in srgb, #5b8ede 62%, #eff1f6)",
		      "--dsw-static-blue-400": "color-mix(in srgb, #5b8ede 82%, #eff1f6)",
		      "--dsw-static-blue-450": "#5b8ede",
		      "--dsw-static-blue-500": "#5b8ede",
		      "--dsw-static-blue-600": "color-mix(in srgb, #3f6bb5 72%, #eff1f6)",
		      "--dsw-static-blue-800": "color-mix(in srgb, #3f6bb5 55%, #eef0f5)",
		      "--dsw-static-blue-900": "color-mix(in srgb, #5b8ede 30%, #eef0f5)",
		      "--dsw-static-blue-950": "color-mix(in srgb, #5b8ede 20%, #eef0f5)",
		      "--dsw-static-blue-50p": "color-mix(in srgb, #5b8ede 40%, #33477a)",
		      "--dsw-static-green-100": "color-mix(in srgb, #6f8a55 28%, #33477a)",
		      "--dsw-static-green-400": "color-mix(in srgb, #6f8a55 72%, #eff1f6)",
		      "--dsw-static-green-500": "#6f8a55",
		      "--dsw-static-green-900": "color-mix(in srgb, #6f8a55 32%, #eef0f5)",
		      "--dsw-static-red-50": "color-mix(in srgb, #e06a8a 40%, #33477a)",
		      "--dsw-static-red-100": "color-mix(in srgb, #e06a8a 26%, #33477a)",
		      "--dsw-static-red-400": "color-mix(in srgb, #e06a8a 74%, #eff1f6)",
		      "--dsw-static-red-500": "#e06a8a",
		      "--dsw-static-red-600": "color-mix(in srgb, #e06a8a 66%, #eef0f5)",
		      "--dsw-static-red-900": "color-mix(in srgb, #e06a8a 32%, #eef0f5)",
		      "--dsw-static-amber-100": "color-mix(in srgb, #a08a5e 28%, #33477a)",
		      "--dsw-static-amber-400": "color-mix(in srgb, #a08a5e 82%, #eff1f6)",
		      "--dsw-static-amber-500": "#c07a3a",
		      "--dsw-static-amber-600": "#c07a3a",
		      "--dsw-static-amber-900": "color-mix(in srgb, #c07a3a 38%, #eef0f5)",
		      "--dsw-alias-bg-base": "rgba(238, 240, 245, 0.3)",
		      "--dsw-alias-bg-layer-1": "rgba(246, 247, 251, 0.24)",
		      "--dsw-alias-bg-layer-2": "rgba(229, 232, 242, 0.54)",
		      "--dsw-alias-bg-layer-3": "rgba(220, 224, 236, 0.72)",
		      "--dsw-alias-bg-overlay": "rgba(239, 241, 246, 0.85)",
		      "--dsw-specific-sidebar-fill": "rgba(238, 240, 245, 0.3)",
		      "--dsw-specific-sidebar-nav-item-hover": "rgba(229, 232, 242, 0.84)",
		      "--dsw-specific-sidebar-nav-item-active": "rgba(229, 232, 242, 0.85)",
		      "--dsw-specific-input-major": "rgba(238, 240, 245, 0.78)",
		      "--dsw-specific-login-input": "rgba(238, 240, 245, 0.78)",
		      "--dsw-specific-selector": "rgba(229, 232, 242, 0.85)",
		      "--dsw-specific-bubble": "rgba(229, 232, 242, 0.85)",
		      "--dsw-specific-bubble-highlight": "rgba(220, 224, 236, 0.85)",
		      "--dsw-alias-bg-module-platform": "rgba(229, 232, 242, 0.85)",
		      "--dsw-alias-bg-multi-select": "rgba(229, 232, 242, 0.85)",
		      "--dsw-alias-bg-skeleton": "rgba(220, 224, 236, 0.24)",
		      "--dsw-alias-markdown-code-block": "rgba(246, 247, 251, 0.85)",
		      "--dsw-alias-markdown-code-block-banner": "rgba(229, 232, 242, 0.85)",
		      "--dsw-alias-markdown-code-segment-selected": "rgba(229, 232, 242, 0.85)",
		      "--dsw-alias-markdown-code-segment-unselected": "rgba(246, 247, 251, 0.85)",
		      "--dsw-alias-markdown-citation": "rgba(229, 232, 242, 0.85)",
		      "--dsw-alias-markdown-inline-code": "rgba(229, 232, 242, 0.85)",
		      "--dsw-alias-markdown-placeholder": "rgba(229, 232, 242, 0.85)",
		      "--dsw-alias-markdown-tag": "rgba(229, 232, 242, 0.85)",
		      "--dsw-alias-button-elevated-fill": "rgba(229, 232, 242, 0.85)",
		      "--dsw-alias-button-primary-dimmed": "rgba(229, 232, 242, 0.85)",
		      "--dsw-alias-button-floating-fill": "rgba(229, 232, 242, 0.85)",
		      "--dsw-alias-button-floating-hover": "rgba(213, 217, 231, 0.85)",
		      "--dsw-alias-button-ghost-active-fill": "rgba(229, 232, 242, 0.85)",
		      "--dsw-alias-button-ghost-active-hover": "rgba(229, 232, 242, 0.85)",
		      "--dsw-alias-state-business-tertiary": "rgba(229, 232, 242, 0.85)",
		      "--dsw-alias-state-success-tertiary": "rgba(229, 232, 242, 0.85)",
		      "--dsw-alias-state-warn-tertiary": "rgba(229, 232, 242, 0.85)",
		      "--dsw-alias-interactive-bg-hover": "rgba(229, 232, 242, 0.85)",
		      "--dsw-alias-interactive-bg-active": "rgba(213, 217, 231, 0.85)",
		      "--dsw-alias-interactive-bg-hover-solid": "rgba(229, 232, 242, 0.85)",
		      "--dsw-alias-scrollbar-bg-l1": "rgba(229, 232, 242, 0.85)",
		      "--dsw-alias-scrollbar-bg-l2": "rgba(229, 232, 242, 0.85)",
		      "--dsw-alias-scrollbar-hover-l1": "rgba(213, 217, 231, 0.85)",
		      "--dsw-alias-scrollbar-hover-l2": "rgba(213, 217, 231, 0.85)",
		      "--dsw-specific-menu": "rgba(239, 241, 246, 0.85)",
		      "--dsw-specific-tip": "rgba(239, 241, 246, 0.85)",
		      "--dsw-alias-toast-bg": "rgba(239, 241, 246, 0.85)",
		      "--dsw-alias-tooltip-bg": "rgba(229, 232, 242, 0.85)",
		      "--dsw-alias-bg-mask-1": "rgba(251, 252, 254, 0.5)",
		      "--dsw-alias-bg-mask-2": "rgba(251, 252, 254, 0.2)",
		      "--dsw-alias-bg-mask-3": "rgba(251, 252, 254, 0.48)",
		      "--dwa-root-base": "color-mix(in srgb, #eff1f6 55%, transparent)",
		      "--dwa-panel-fill": "rgba(238, 240, 245, 0.75)",
		      "--dwa-panel-blur": "30px",
		      "--dwa-menu-solid": "#fbfcfe",
		      "--tv-color-text": "var(--dsw-alias-label-primary)",
		      "--tv-color-text-important": "var(--dsw-alias-label-primary)",
		      "--tv-color-text-control": "var(--dsw-alias-label-primary)",
		      "--tv-color-text-secondary": "var(--dsw-alias-label-secondary)",
		      "--tv-color-text-weaken": "var(--dsw-alias-label-tertiary)",
		      "--tv-color-text-placeholder": "var(--dsw-alias-label-tertiary)",
		      "--tv-color-text-disabled": "var(--dsw-alias-label-dimmed)",
		      "--tv-color-text-active": "var(--dsw-alias-brand-primary)",
		      "--tv-color-text-link": "var(--dsw-alias-brand-primary)",
		      "--tv-color-icon": "var(--dsw-alias-label-secondary)",
		      "--tv-color-bg-1": "var(--dsw-alias-bg-layer-1)",
		      "--tv-color-bg-2": "var(--dsw-alias-bg-layer-2)",
		      "--tv-color-bg-3": "var(--dsw-alias-bg-layer-2)",
		      "--tv-color-bg-gray-1": "var(--dsw-alias-bg-layer-2)",
		      "--tv-color-bg-header": "var(--dsw-alias-bg-layer-3)",
		      "--tv-color-bg-hover": "var(--dsw-alias-interactive-bg-hover)",
		      "--tv-color-bg-hover-1": "var(--dsw-alias-interactive-bg-hover)",
		      "--tv-color-bg-active-emphasize-light": "var(--dsw-alias-interactive-bg-hover-accent)",
		      "--tv-color-border": "var(--dsw-alias-border-l2)",
		      "--tv-color-border-divider": "var(--dsw-alias-border-l1)",
		      "--tv-color-border-divider-short": "var(--dsw-alias-border-l1)",
		      "--tv-color-error-text": "var(--dsw-alias-state-error-primary)",
		      "--dsw-desktop-window-tint": "color-mix(in srgb, #ffffff 26%, transparent)",
		      "--dsw-menu-backdrop-filter": "blur(24px) saturate(1.15)",
		      "--dsw-alias-border-l1": "rgba(192, 196, 216, 0.26)",
		      "--dsw-alias-border-l2": "rgba(192, 196, 216, 0.4)",
		      "--dsw-alias-border-l3": "rgba(192, 196, 216, 0.52)",
		      "--dsw-alias-border-l4": "rgba(192, 196, 216, 0.66)",
		      "--dsw-alias-label-primary": "#33477a",
		      "--dsw-alias-label-secondary": "#5d6c9c",
		      "--dsw-alias-label-tertiary": "#4d5b8b",
		      "--dsw-alias-label-caption": "#7d84a8",
		      "--dsw-alias-label-dimmed": "#8b93b8",
		      "--dsw-alias-brand-primary": "#5b8ede",
		      "--dsw-alias-brand-text": "#ffffff",
		      "--dsw-alias-button-primary-fill": "#5b8ede",
		      "--dsw-alias-button-primary-hover": "color-mix(in srgb, #5b8ede 85%, #ffffff)",
		      "--dsw-alias-button-ghost-active-border": "#d5d9e7",
		      "--dsw-alias-state-business-primary": "#5b8ede",
		      "--dsw-alias-state-error-primary": "#e06a8a",
		      "--dsw-alias-state-error-secondary": "#e06a8a",
		      "--dsw-alias-state-success-primary": "#6f8a55",
		      "--dsw-alias-state-success-secondary": "#6f8a55",
		      "--dsw-alias-state-warn-label": "#a08a5e",
		      "--dsw-alias-state-warn-primary": "#a08a5e",
		      "--dsw-alias-state-warn-secondary": "#a08a5e",
		      "--dsw-alias-interactive-bg-hover-accent": "rgba(91, 142, 222, 0.14)",
		      "--dsw-alias-interactive-bg-hover-danger": "rgba(224, 106, 138, 0.14)",
		      "--dsw-alias-separator-primary": "rgba(91, 142, 222, 0.5)",
		      "--shiki-foreground": "#33477a",
		      "--shiki-background": "rgba(246, 247, 251, 0.6)",
		      "--shiki-token-constant": "#c07a3a",
		      "--shiki-token-string": "#6f8a55",
		      "--shiki-token-comment": "#8b93b8",
		      "--shiki-token-keyword": "#a678e0",
		      "--shiki-token-parameter": "#e06a8a",
		      "--shiki-token-function": "#5b8ede",
		      "--shiki-token-string-expression": "#6f8a55",
		      "--shiki-token-punctuation": "#5d6c9c",
		      "--shiki-token-link": "#5b8ede",
		      "--shiki-token-inserted": "#6f8a55",
		      "--shiki-token-deleted": "#e06a8a",
		      "--shiki-token-changed": "#a08a5e"
		    }
		  }
		];
		/** Acrylic tuning (from src/theme.mjs). */
		const ACRYLIC = {
		   "blurPx": 15,
		   "menuBlurPx": 24,
		   "materialBlurPx": 28,
		   "saturate": "1.1",
		   "menuSaturate": "1.15",
		   "noiseOpacity": "0.03"
		};
		/** Stage switch: whether the blur layer ships in this build. */
		const ACRYLIC_ENABLED = true;
		/** Page base CSS — always mounted while one of our themes is active. */
		const BASE_CSS = ":root[data-dwa-theme] {\n  background: var(--dwa-root-base, transparent);\n}\n:root[data-dwa-theme] {\n  color-scheme: dark;\n}\n:root[data-dwa-theme] body:not([data-ds-dark-theme]) {\n  color-scheme: light;\n}\n:root[data-dwa-theme] body::before {\n  content: \"\";\n  position: fixed;\n  inset: -15%;\n  z-index: -2;\n  pointer-events: none;\n  background:\n    radial-gradient(45% 45% at 18% 22%, color-mix(in srgb, #7aa2f7 30%, transparent), transparent 70%),\n    radial-gradient(40% 40% at 82% 18%, color-mix(in srgb, #bb9af7 24%, transparent), transparent 70%),\n    radial-gradient(50% 50% at 68% 88%, color-mix(in srgb, #7dcfff 20%, transparent), transparent 70%),\n    linear-gradient(160deg, #1a1b26, #16161e 55%, #0b0b12);\n  filter: blur(28px) saturate(1.2);\n}\n:root[data-dwa-theme] body:not([data-ds-dark-theme])::before {\n  content: \"\";\n  position: fixed;\n  inset: -15%;\n  z-index: -2;\n  pointer-events: none;\n  background:\n    radial-gradient(45% 45% at 18% 22%, color-mix(in srgb, #5b8ede 24%, transparent), transparent 70%),\n    radial-gradient(40% 40% at 82% 18%, color-mix(in srgb, #a678e0 19%, transparent), transparent 70%),\n    radial-gradient(50% 50% at 68% 88%, color-mix(in srgb, #3a8ba8 16%, transparent), transparent 70%),\n    linear-gradient(160deg, #eff1f6, #eef0f5 55%, #fbfcfe);\n  filter: blur(28px) saturate(1.2);\n}";
		/** Chrome blur layer, generated from ACRYLIC (from src/theme.mjs). */
		const CHROME_CSS = ":root[data-dwa-theme] [data-dwa-blur] {\n  isolation: isolate;\n}\n:root[data-dwa-theme] [data-dwa-blur]::before {\n  content: \"\";\n  position: absolute;\n  inset: 0;\n  z-index: -1;\n  pointer-events: none;\n  border-radius: inherit;\n  -webkit-backdrop-filter: blur(15px) saturate(1.1);\n  backdrop-filter: blur(15px) saturate(1.1);\n}\n:root[data-dwa-theme] body::after {\n  content: \"\";\n  position: fixed;\n  inset: 0;\n  pointer-events: none;\n  z-index: -1;\n  opacity: 0.03;\n  background-image: radial-gradient(rgba(255, 255, 255, 0.9) 0.5px, transparent 0.5px);\n  background-size: 3px 3px;\n}\n@media (prefers-reduced-transparency: reduce) {\n:root[data-dwa-theme] [data-dwa-blur]::before {\n    -webkit-backdrop-filter: none;\n    backdrop-filter: none;\n  }\n}\n:root[data-dwa-theme] body[data-ds-dark-theme] [data-dwa-frost] {\n  background-image: radial-gradient(\n    color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent) 0.5px,\n    transparent 0.5px);\n  background-size: 3px 3px;\n}\n:root[data-dwa-theme] body:not([data-ds-dark-theme]) [data-dwa-frost] {\n  background-image: radial-gradient(\n    color-mix(in srgb, var(--dsw-alias-label-primary) 14%, transparent) 0.5px,\n    transparent 0.5px);\n  background-size: 3px 3px;\n}\n:root[data-dwa-theme] [data-dwa-panel] {\n  isolation: isolate;\n  background-color: var(--dwa-panel-fill) !important;\n}\n:root[data-dwa-theme] [data-dwa-panel]::before {\n  content: \"\";\n  position: absolute;\n  inset: 0;\n  z-index: -1;\n  pointer-events: none;\n  border-radius: inherit;\n  -webkit-backdrop-filter: blur(var(--dwa-panel-blur, 30px)) saturate(1.1);\n  backdrop-filter: blur(var(--dwa-panel-blur, 30px)) saturate(1.1);\n}";
		/** Candidate containers for the blur layer (from src/theme.mjs). */
		const HOST_SELECTORS = [
		  "[class$=\"_sidebarCol\"]",
		  "[class$=\"_centerCol\"]",
		  "[class$=\"_dock\"]",
		  "[class$=\"_topbar\"]",
		  "[class$=\"_header\"]"
		];
		/** Attribute that arms the layer on one container (from src/theme.mjs). */
		const HOST_ATTRIBUTE = "data-dwa-blur";
		/** Containers that get the static frosted texture (from src/theme.mjs). */
		const FROST_SELECTORS = [
		  "[class$=\"_sidebarCol\"]",
		  "[class$=\"_sidebar\"]",
		  "[class$=\"_sider\"]",
		  "[class$=\"_drawer\"]"
		];
		/** Attribute that arms the frosted texture (from src/theme.mjs). */
		const FROST_ATTRIBUTE = "data-dwa-frost";
		/** Dialogs that become frosted panels (from src/theme.mjs). */
		const PANEL_SELECTORS = [
		  "[role=\"dialog\"]",
		  "dialog"
		];
		/** Attribute that arms the frosted panel (from src/theme.mjs). */
		const PANEL_ATTRIBUTE = "data-dwa-panel";
		/** Theme applied when the user has not chosen yet. */
		const DEFAULT_SKIN = "tokyo-night";
		/** Sentinel for "follow the shell's built-in appearance". */
		const NATIVE_SKIN = "system";
		/** Monospace families for the font dropdowns (from src/theme.mjs). */
		const MONO_FONTS = [
		  "JetBrains Mono",
		  "Fira Code",
		  "Cascadia Code",
		  "Source Code Pro",
		  "IBM Plex Mono",
		  "Roboto Mono",
		  "Ubuntu Mono",
		  "SF Mono",
		  "Menlo",
		  "Consolas",
		  "Liberation Mono",
		  "DejaVu Sans Mono",
		  "Courier New"
		];
		/** Probe catalog: bases × patched suffixes (from src/theme.mjs). */
		const MONO_FONT_BASES = [
		  "Cascadia Code",
		  "Cascadia Mono",
		  "JetBrains Mono",
		  "JetBrainsMono",
		  "Fira Code",
		  "FiraCode",
		  "Fira Mono",
		  "Source Code Pro",
		  "IBM Plex Mono",
		  "Roboto Mono",
		  "Ubuntu Mono",
		  "UbuntuMono",
		  "Hack",
		  "Inconsolata",
		  "Victor Mono",
		  "Iosevka",
		  "Iosevka Term",
		  "Terminus",
		  "Maple Mono",
		  "Maple Mono CN",
		  "Sarasa Mono SC",
		  "Sarasa Mono TC",
		  "Sarasa Fixed SC",
		  "LXGW WenKai Mono",
		  "Noto Sans Mono",
		  "Noto Sans Mono CJK SC",
		  "Anonymous Pro",
		  "Cousine",
		  "PT Mono",
		  "Space Mono",
		  "Input Mono",
		  "Menlo",
		  "SF Mono",
		  "Consolas",
		  "Lucida Console",
		  "Courier New",
		  "DejaVu Sans Mono",
		  "Liberation Mono",
		  "Bitstream Vera Sans Mono",
		  "Monaco",
		  "Andale Mono"
		];
		const MONO_FONT_SUFFIXES = [
		  "",
		  " NF",
		  " NFM",
		  " Nerd Font",
		  " Nerd Font Mono",
		  " PL"
		];
		//#endregion

		//#region tokyo-night: configuration
		/** localStorage keys. */
		const THEME_KEY = "dsh-desktop-acrylic:theme";
		const FONT_KEY = "dsh-desktop-acrylic:font";
		const CODE_FONT_KEY = "dsh-desktop-acrylic:codeFont";
		const ACRYLIC_KEY = "dsh-desktop-acrylic:acrylic";
		/** Settings row identity. */
		const ROW_ID = "tokyo-night";
		const SETTINGS_NS = "settings.tokyo-night";
		/** Host route: durable state + status report. */
		const STATE_ROUTE = "/dark-acrylic/state";
		/** Host route: families actually installed on this machine. */
		const FONTS_ROUTE = "/dark-acrylic/fonts";
		/** Boot-time re-assert delay (other theme plugins restore first). */
		const REASSERT_DELAY_MS = 800;
		/** Debounce for status reports. */
		const REPORT_DEBOUNCE_MS = 300;
		/** Root attribute that arms the acrylic layer. */
		const ARM_ATTRIBUTE = "data-dwa-theme";
		/** Style element ids. */
		const CHROME_STYLE_ID = "dsh-desktop-acrylic-chrome";
		const FONT_STYLE_ID = "dsh-desktop-acrylic-font";
		//#endregion

		//#region tokyo-night: runtime probes
		/** Theme service handle, set in apply(). */
		let themeService = null;

		/** Current theme preference, or "" when unavailable. */
		function preferenceOf() {
			try {
				const snapshot = themeService === null ? null : themeService.getTheme();
				return snapshot !== null && typeof snapshot === "object" && typeof snapshot.preference === "string"
					? snapshot.preference
					: "";
			} catch {
				return "";
			}
		}

		/** Is one of our themes the active preference? */
		function isOursActive() {
			const preference = preferenceOf();
			return SKINS.some((skin) => skin.id === preference);
		}

		/** What the browser actually resolved — proof the tokens took effect. */
		function readComputedSurfaces() {
			try {
				const style = window.getComputedStyle(document.body);
				return {
					bgBase: style.getPropertyValue("--dsw-alias-bg-base").trim(),
					sidebar: style.getPropertyValue("--dsw-specific-sidebar-fill").trim(),
					menuBlur: style.getPropertyValue("--dsw-menu-backdrop-filter").trim()
				};
			} catch {
				return { bgBase: "", sidebar: "", menuBlur: "" };
			}
		}
		//#endregion

		//#region tokyo-night: stylesheets
		const styleElements = { chrome: null, font: null };

		function mountStyle(slot, id, css) {
			if (typeof css !== "string" || css.length === 0) return;
			let element = styleElements[slot];
			if (element === null) element = document.getElementById(id);
			if (element === null) {
				element = document.createElement("style");
				element.id = id;
				styleElements[slot] = element;
			}
			if (element.textContent !== css) element.textContent = css;
			if (!element.isConnected) document.head.appendChild(element);
		}

		function unmountStyle(slot) {
			const element = styleElements[slot];
			if (element !== null && element.isConnected) element.remove();
		}

		function isChromeMounted() {
			const element = styleElements.chrome;
			return element !== null && element.isConnected === true;
		}

		/**
		 * Sanitise a user-supplied font list into the override rule the shell's
		 * variables expect. `!important` is required: the runtime writes
		 * `--dsw-font-family` as a non-important inline property on <body>, and
		 * only an important declaration on that same element can outrank it.
		 *
		 * The fallback stack is spelled out instead of referencing
		 * `var(--dsw-font-family)`: a self-reference is a CSS cycle, which kills
		 * the variable and every `font:` shorthand that reads it.
		 */
		function buildFontCss(family, codeFamily) {
			const clean = typeof family === "string" ? family.replace(/[";{}]/g, "").trim() : "";
			if (clean.length === 0) return "";
			const code = typeof codeFamily === "string" ? codeFamily.replace(/[";{}]/g, "").trim() : "";
			const uiFallback = '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';
			const codeFallback = '"SF Mono", "JetBrains Mono", Consolas, "Liberation Mono", monospace';
			const lines = [`  --dsw-font-family: ${clean}, ${uiFallback} !important;`];
			if (code.length > 0) lines.push(`  --ds-font-family-code: ${code}, ${codeFallback} !important;`);
			return `:root[${ARM_ATTRIBUTE}] body {\n${lines.join("\n")}\n}`;
		}

		/** Number of containers currently carrying the blur layer. */
		let blurHostCount = 0;
		/** Number of containers carrying the imitation frost texture. */
		let frostCount = 0;
		/** Mutation observer + debounce timer for late-mounted surfaces. */
		let frostObserver = null;
		let rearmTimer = null;
		/** Set by applyInner: debounced status report. */
		let reportRequest = null;
		/** What the dialog pass textured, for diagnostics (short list). */
		let frostTargets = [];
		/** Diagnostics: how many candidates matched, armed, or were skipped. */
		let blurHostStats = { matched: 0, armed: 0, skipped: 0 };
		/** Which catalog the font dropdowns use, and how many families it holds. */
		let fontSource = "builtin";
		let fontCount = 0;

		/**
		 * Arm the blur layer, element by element.
		 *
		 * A container only qualifies when it is **already positioned**: the layer
		 * is an absolutely positioned pseudo-element, and inside a static
		 * container it would escape to the nearest positioned ancestor, span the
		 * viewport and frost the whole interface — text included. That was the
		 * v0.3.0 / v0.3.3 regression, and this check is what rules it out.
		 *
		 * Containers never get `position` or `backdrop-filter` themselves: either
		 * one would make them a containing block for their absolutely or fixed
		 * positioned children, and the shell anchors its window controls (sidebar
		 * toggle, new-session button) exactly that way.
		 *
		 * The counts are reported so "no frost" can be traced to its cause:
		 * selectors that match nothing, versus containers that fail the guard.
		 */
		function armBlurHosts() {
			let matched = 0;
			let armed = 0;
			for (const selector of HOST_SELECTORS) {
				let nodes = [];
				try {
					nodes = Array.prototype.slice.call(document.querySelectorAll(selector));
				} catch {
					nodes = [];
				}
				matched += nodes.length;
				for (const node of nodes) {
					let positioned = false;
					try {
						positioned = window.getComputedStyle(node).position !== "static";
					} catch {
						positioned = false;
					}
					if (positioned) {
						node.setAttribute(HOST_ATTRIBUTE, "");
						armed += 1;
					} else {
						node.removeAttribute(HOST_ATTRIBUTE);
					}
				}
			}
			blurHostCount = armed;
			blurHostStats = { matched, armed, skipped: matched - armed };
			return armed;
		}

		/** Drop every attribute we may have set (blur layer and frost texture). */
		function disarmBlurHosts() {
			try {
				const nodes = document.querySelectorAll(`[${HOST_ATTRIBUTE}], [${FROST_ATTRIBUTE}], [${PANEL_ATTRIBUTE}]`);
				for (const node of Array.prototype.slice.call(nodes)) {
					node.removeAttribute(HOST_ATTRIBUTE);
					node.removeAttribute(FROST_ATTRIBUTE);
				}
			} catch {
				// nothing to clean up
			}
			blurHostCount = 0;
			blurHostStats = { matched: 0, armed: 0, skipped: 0 };
			frostCount = 0;
			panelsCount = 0;
			fontCount = fontSource === "host" ? fontCount : MONO_FONTS.length;
		}
		/**
		 * Arm the imitation frost.
		 *
		 * It needs no positioning and no filter: it is a `background-image` on the
		 * element itself, so it works on containers the blur layer has to refuse
		 * (the sidebar among them) without disturbing layout or stacking.
		 */
		function armFrostSurfaces() {
			let armed = 0;
			for (const selector of FROST_SELECTORS) {
				let nodes = [];
				try {
					nodes = Array.prototype.slice.call(document.querySelectorAll(selector));
				} catch {
					nodes = [];
				}
				for (const node of nodes) {
					node.setAttribute(FROST_ATTRIBUTE, "");
					armed += 1;
				}
			}
			frostCount = armed;
			return armed;
		}

		/**
		 * Arm the imitation frost on the *insides of dialogs* — the settings
		 * window's own navigation column, for instance. Those panels do not exist
		 * when the plugin boots, so they are found heuristically: the smallest
		 * element inside a dialog that holds several stacked buttons, plus its
		 * parent column. Only one column per dialog is touched, and only with the
		 * 7~9% texture, so a wrong guess costs a faint sheen, nothing else.
		 */
		/**
		 * Turn dialogs into frosted panels: the surface runs at 25% transparency
		 * and carries a 30px backdrop blur.
		 *
		 * Only dialogs that are already positioned are armed — the blur lives on
		 * an absolutely positioned `::before`, which needs a containing block. The
		 * dialog's own `position` is never touched: that would re-anchor its
		 * absolutely / fixed positioned children.
		 */
		function armDialogPanels() {
			let armed = 0;
			frostTargets = [];
			let dialogs = [];
			try {
				dialogs = Array.prototype.slice.call(document.querySelectorAll(PANEL_SELECTORS.join(",")));
			} catch {
				dialogs = [];
			}
			for (const dialog of dialogs) {
				let rect = null;
				let positioned = false;
				try {
					rect = dialog.getBoundingClientRect();
					positioned = window.getComputedStyle(dialog).position !== "static";
				} catch {
					positioned = false;
				}
				if (rect === null || rect.width < 200 || rect.height < 140) continue;
				if (!positioned) {
					dialog.removeAttribute(PANEL_ATTRIBUTE);
					continue;
				}
				dialog.setAttribute(PANEL_ATTRIBUTE, "");
				armed += 1;
				recordFrostTarget(dialog);
			}
			return armed;
		}

		/** Remember what was textured, for the status report (capped, short). */
		function recordFrostTarget(node) {
			if (frostTargets.length >= 8) return;
			try {
				const tag = String(node.tagName || "?").toLowerCase();
				const cls = typeof node.className === "string" ? node.className.split(/\s+/)[0] || "" : "";
				const entry = cls.length > 0 ? `${tag}.${cls}` : tag;
				if (!frostTargets.includes(entry)) frostTargets.push(entry);
			} catch {
				// ignore
			}
		}

		/** Watch for late-mounted surfaces (dialogs) and re-arm, debounced. */
		function startFrostObserver() {
			if (frostObserver !== null) return;
			try {
				frostObserver = new MutationObserver(() => scheduleRearm());
				frostObserver.observe(document.body, { childList: true, subtree: true });
			} catch {
				frostObserver = null;
			}
		}

		function stopFrostObserver() {
			if (frostObserver === null) return;
			try {
				frostObserver.disconnect();
			} catch {
				// already gone
			}
			frostObserver = null;
		}

		function scheduleRearm() {
			if (rearmTimer !== null) clearTimeout(rearmTimer);
			rearmTimer = setTimeout(() => {
				rearmTimer = null;
				if (!ACRYLIC_ENABLED || !readAcrylic() || !isOursActive()) return;
				armBlurHosts();
				frostCount = armFrostSurfaces();
				panelsCount = armDialogPanels();
				if (reportRequest !== null) reportRequest();
			}, 250);
		}
		function syncChrome(active) {
			const root = document.documentElement;
			if (active) {
				root.setAttribute(ARM_ATTRIBUTE, "");
				if (ACRYLIC_ENABLED && readAcrylic()) {
					mountStyle("chrome", CHROME_STYLE_ID, `${BASE_CSS}\n${CHROME_CSS}`);
					armBlurHosts();
					frostCount = armFrostSurfaces();
					panelsCount = armDialogPanels();
					startFrostObserver();
				} else {
					disarmBlurHosts();
					stopFrostObserver();
					mountStyle("chrome", CHROME_STYLE_ID, BASE_CSS);
				}
			} else {
				root.removeAttribute(ARM_ATTRIBUTE);
				disarmBlurHosts();
				unmountStyle("chrome");
			}
		}

		/** The font override is rebuilt whenever the user edits it. */
		function syncFont(font, codeFont, active) {
			const css = buildFontCss(font, codeFont);
			if (active && css.length > 0) mountStyle("font", FONT_STYLE_ID, css);
			else unmountStyle("font");
		}
		//#endregion

		//#region tokyo-night: durable state + status channel
		const durable = { chosen: null, font: null, codeFont: null, acrylic: null };
		const INSTANCE_ID = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

		/**
		 * Which of `candidates` this machine actually has.
		 *
		 * Chromium will not enumerate installed fonts, but it does report a
		 * different metrics result for a family that exists than for one that
		 * silently fell through to the fallback — measured against three
		 * fallbacks so a family that merely matches one of them is not accepted.
		 */
		function detectLocalFonts(candidates) {
			let ctx = null;
			try {
				ctx = document.createElement("canvas").getContext("2d");
			} catch {
				ctx = null;
			}
			if (ctx === null) return [];
			const probe = "mmmmmmmmmmlliWWWW";
			const fallbacks = ["monospace", "serif", "sans-serif"];
			const baseline = fallbacks.map((fallback) => {
				ctx.font = `72px ${fallback}`;
				return ctx.measureText(probe).width;
			});
			const available = [];
			for (const family of candidates) {
				for (let i = 0; i < fallbacks.length; i += 1) {
					ctx.font = `72px "${family}", ${fallbacks[i]}`;
					if (ctx.measureText(probe).width !== baseline[i]) {
						available.push(family);
						break;
					}
				}
			}
			return available;
		}

		/**
		 * Families installed on this machine.
		 *
		 * Two independent sources, because neither is sufficient alone:
		 *
		 * 1. Renderer probing (always available): the candidate bases crossed with
		 *    the Nerd Font / Powerline suffixes, so patched builds are found under
		 *    their real names. It can only find names it knows about.
		 * 2. The host scan (when the running app exposes the route): it reads the
		 *    font directories and classifies by `post.isFixedPitch`, so it finds
		 *    faces the catalog never guessed — including CJK monospace families.
		 *
		 * The union is used; a missing host route simply means a shorter list.
		 */
		async function loadSystemFonts() {
			const candidates = [];
			for (const base of MONO_FONT_BASES) {
				for (const suffix of MONO_FONT_SUFFIXES) candidates.push(`${base}${suffix}`);
			}
			const probed = detectLocalFonts(candidates);
			let hosted = [];
			try {
				const response = await fetch(FONTS_ROUTE);
				if (response.ok) {
					const payload = await response.json();
					if (payload !== null && typeof payload === "object") {
						const monospace = Array.isArray(payload.monospace) ? payload.monospace : [];
						const all = Array.isArray(payload.all) ? payload.all : [];
						const patched = all.filter((family) => /nerd|\bnf\b|\bpl\b|powerline|glyph/i.test(String(family)));
						hosted = monospace.concat(patched);
					}
				}
			} catch {
				hosted = [];
			}
			const merged = Array.from(
				new Set(probed.concat(hosted).map((f) => String(f).trim()).filter(Boolean))
			);
			if (merged.length === 0) return null;
			fontSource = hosted.length > 0 ? (probed.length > 0 ? "host+probe" : "host") : "probe";
			fontCount = merged.length;
			// Code-style faces first: CJK fonts also report fixed pitch and would
			// otherwise crowd out the ones a developer actually wants.
			const codeish = /code|mono|console|cascadia|jetbrains|fira|hack|inconsolata|menlo|courier|source|plex|roboto|ubuntu|dejavu|liberation|sarasa|maple|lxgw|terminus|iosevka/i;
			return merged.sort((a, b) => {
				const aCode = codeish.test(a) ? 0 : 1;
				const bCode = codeish.test(b) ? 0 : 1;
				return aCode === bCode ? a.localeCompare(b) : aCode - bCode;
			});
		}

		/** Whether the blur layer is wanted: durable file → localStorage → on. */
		function readAcrylic() {
			if (typeof durable.acrylic === "boolean") return durable.acrylic;
			try {
				const stored = window.localStorage.getItem(ACRYLIC_KEY);
				if (stored === "0") return false;
				if (stored === "1") return true;
			} catch {
				// storage unavailable
			}
			return true;
		}

		/** Chosen theme id: durable file → localStorage → null (not chosen yet). */
		function readChosen() {
			if (typeof durable.chosen === "string") return durable.chosen;
			try {
				const stored = window.localStorage.getItem(THEME_KEY);
				if (typeof stored === "string" && stored.length > 0) return stored;
			} catch {
				// storage unavailable
			}
			return null;
		}

		function readFont(kind) {
			const key = kind === "code" ? "codeFont" : "font";
			const localKey = kind === "code" ? CODE_FONT_KEY : FONT_KEY;
			if (typeof durable[key] === "string") return durable[key];
			try {
				const stored = window.localStorage.getItem(localKey);
				if (typeof stored === "string") return stored;
			} catch {
				// storage unavailable
			}
			return "";
		}

		function writeLocal(key, value) {
			try {
				if (typeof value === "string" && value.length > 0) window.localStorage.setItem(key, value);
				else window.localStorage.removeItem(key);
			} catch {
				// storage unavailable — the durable layer still carries it
			}
		}

		/** Persist fields locally, then mirror the whole state to the host. */
		function persist(patch) {
			Object.assign(durable, patch);
			if (Object.prototype.hasOwnProperty.call(patch, "chosen")) writeLocal(THEME_KEY, patch.chosen);
			if (Object.prototype.hasOwnProperty.call(patch, "font")) writeLocal(FONT_KEY, patch.font);
			if (Object.prototype.hasOwnProperty.call(patch, "codeFont")) writeLocal(CODE_FONT_KEY, patch.codeFont);
			if (Object.prototype.hasOwnProperty.call(patch, "acrylic")) writeLocal(ACRYLIC_KEY, patch.acrylic ? "1" : "0");
			void report();
		}

		/** Read the durable state from the host (also our own status ledger). */
		async function hydrate() {
			try {
				const response = await fetch(STATE_ROUTE);
				if (!response.ok) return;
				const state = await response.json();
				if (state === null || typeof state !== "object") return;
				if (typeof state.chosen === "string") durable.chosen = state.chosen;
				if (typeof state.font === "string") durable.font = state.font;
				if (typeof state.codeFont === "string") durable.codeFont = state.codeFont;
				if (typeof state.acrylic === "boolean") durable.acrylic = state.acrylic;
			} catch {
				// route absent — browser flags remain authoritative
			}
		}

		/** Push a status snapshot; diagnostics only, never throws. */
		async function report() {
			try {
				await fetch(STATE_ROUTE, {
					method: "PUT",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						version: 2,
						plugin: "tokyo-night-theme",
						themes: SKINS.map((skin) => skin.id),
						chosen: readChosen(),
						acrylic: readAcrylic(),
						font: readFont("font"),
						codeFont: readFont("code"),
						preference: preferenceOf(),
						chrome: isChromeMounted(),
						hosts: blurHostCount,
						hostStats: blurHostStats,
						frost: frostCount,
						panels: panelsCount,
						fontSource: fontSource,
						fontCount: fontCount,
						frostTargets: frostTargets.slice(0, 6),
						computed: readComputedSurfaces(),
						instance: INSTANCE_ID,
						at: new Date().toISOString()
					})
				});
			} catch {
				// route absent — in-app diagnostics only
			}
		}
		//#endregion

		//#region tokyo-night: settings row
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"row.title": "Tokyo Night 主题",
			"row.description": "Tokyo Night 的暗色与亮色两套主题；图标随主题色走，下面可选全局字体。",
			"row.theme": "主题",
			"row.themeNight": "暗色",
			"row.themeDay": "亮色",
			"row.themeNative": "默认",
			"row.acrylic": "亚克力",
			"row.acrylicOn": "模糊已开",
			"row.acrylicOff": "模糊已关",
			"row.font": "界面字体",
			"row.fontDefault": "跟随默认（系统字体）",
			"row.codeFont": "代码字体",
			"row.fontMonoHint": "下拉仅列出本机可用的等宽字体",
			"row.fontSearch": "搜索字体…",
			"row.clear": "恢复默认",
			"row.diagnostics": "诊断"
		};

		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"row.title": "Tokyo Night theme",
			"row.description": "Tokyo Night dark and light themes; icons follow the palette. Global font options below.",
			"row.theme": "Theme",
			"row.themeNight": "Dark",
			"row.themeDay": "Light",
			"row.themeNative": "Default",
			"row.acrylic": "Acrylic",
			"row.acrylicOn": "blur on",
			"row.acrylicOff": "blur off",
			"row.font": "UI font",
			"row.fontDefault": "Follow the default (system) stack",
			"row.codeFont": "Code font",
			"row.fontMonoHint": "Only monospace families installed on this machine",
			"row.fontSearch": "Search fonts…",
			"row.clear": "Reset",
			"row.diagnostics": "Diagnostics"
		};

		const rowStyles = {
			group: {
				borderBottom: "1px solid var(--dsw-alias-border-l2)",
				display: "flex",
				flexDirection: "column",
				gap: "8px",
				padding: "16px 0"
			},
			title: { color: "var(--dsw-alias-label-primary)", fontSize: "14px", lineHeight: "22px" },
			description: { color: "var(--dsw-alias-label-tertiary)", fontSize: "12px", lineHeight: "18px" },
			buttonRow: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" },
			button: {
				border: "1px solid var(--dsw-alias-border-l2)",
				borderRadius: "6px",
				background: "transparent",
				color: "var(--dsw-alias-label-secondary)",
				cursor: "pointer",
				font: "inherit",
				fontSize: "12px",
				lineHeight: "18px",
				padding: "3px 12px"
			},
			buttonActive: {
				borderColor: "var(--dsw-alias-brand-primary)",
				background: "var(--dsw-alias-interactive-bg-hover-accent)",
				color: "var(--dsw-alias-label-primary)"
			},

			/** The picker's closed state: a button that looks like a field. */
			select: {
				border: "1px solid var(--dsw-alias-border-l2)",
				borderRadius: "6px",
				background: "transparent",
				color: "var(--dsw-alias-label-primary)",
				font: "inherit",
				fontSize: "12px",
				lineHeight: "18px",
				padding: "3px 8px",
				minWidth: "200px",
				flex: "1"
			},
			/** Wrapper for the custom picker: anchors the fixed-position list. */
			pickerWrap: { position: "relative", flex: "1", minWidth: "200px" },
			list: {
				position: "fixed",
				zIndex: 9999,
				maxHeight: "320px",
				overflowY: "auto",
				background: "var(--dwa-menu-solid, #1a1b26)",
				color: "var(--dsw-alias-label-primary)",
				border: "1px solid var(--dsw-alias-border-l2)",
				borderRadius: "6px",
				boxShadow: "0 12px 32px rgba(0, 0, 0, 0.28)",
				padding: "4px 0"
			},
			search: {
				width: "100%",
				boxSizing: "border-box",
				border: "none",
				borderBottom: "1px solid var(--dsw-alias-border-l2)",
				background: "transparent",
				color: "var(--dsw-alias-label-primary)",
				font: "inherit",
				fontSize: "12px",
				padding: "6px 10px",
				outline: "none"
			},
			item: {
				padding: "5px 10px",
				fontSize: "12px",
				lineHeight: "18px",
				cursor: "pointer",
				whiteSpace: "nowrap",
				overflow: "hidden",
				textOverflow: "ellipsis"
			},
			itemActive: {
				background: "var(--dsw-alias-interactive-bg-hover-accent)",
				color: "var(--dsw-alias-label-primary)"
			},
			label: { color: "var(--dsw-alias-label-secondary)", fontSize: "12px", lineHeight: "22px", minWidth: "60px" },
			diagnostics: {
				color: "var(--dsw-alias-label-caption)",
				fontFamily: "var(--ds-font-family-code)",
				fontSize: "11px",
				lineHeight: "18px"
			}
		};

		/**
		 * Settings row. Contract (verified against the shell's own rows): props
		 * carry `t` from the `locale` option, `useStore` from the `store` option,
		 * and whatever `inject(actions)` returned.
		 */
		/**
		 * Searchable font picker.
		 *
		 * A native `<select>` cannot do this job: its popup is an OS-level surface
		 * that ignores our colours, cannot be given a height, and does not respond
		 * to the wheel inside the app. This one is ordinary DOM — a fixed-position
		 * scroll container (`max-height` + `overflow-y: auto`), so wheel scrolling
		 * and keyboard dismissal behave normally, and it can be search-filtered
		 * because a machine with many installed fonts easily has 100+ entries.
		 */
		function FontPicker(props) {
			const families = Array.isArray(props.families) ? props.families : [];
			const value = typeof props.value === "string" ? props.value : "";
			const [open, setOpen] = react.useState(false);
			const [query, setQuery] = react.useState("");
			const [anchor, setAnchor] = react.useState(null);
			const wrapRef = react.useRef(null);

			react.useEffect(() => {
				if (!open) return undefined;
				const onDismiss = (event) => {
					// Clicks inside the picker (including the list, which is a fixed
					// positioned child) must not dismiss it.
					if (wrapRef.current !== null && wrapRef.current.contains(event.target)) return;
					if (event.type === "keydown" && event.key !== "Escape") return;
					setOpen(false);
					setQuery("");
				};
				document.addEventListener("mousedown", onDismiss);
				document.addEventListener("keydown", onDismiss);
				return () => {
					document.removeEventListener("mousedown", onDismiss);
					document.removeEventListener("keydown", onDismiss);
				};
			}, [open]);

			const toggle = (event) => {
				if (open) {
					setOpen(false);
					return;
				}
				const rect = event.currentTarget.getBoundingClientRect();
				setAnchor({
					left: rect.left,
					top: rect.bottom + 4,
					width: Math.max(rect.width, 240)
				});
				setOpen(true);
			};

			const pick = (family) => {
				props.onPick(family);
				setOpen(false);
				setQuery("");
			};

			const needle = query.trim().toLowerCase();
			const shown = needle.length === 0 ? families : families.filter((family) => family.toLowerCase().includes(needle));

			return react.createElement(
				"div",
				{ style: rowStyles.pickerWrap, ref: wrapRef },
				react.createElement(
					"button",
					{ type: "button", style: rowStyles.select, onClick: toggle, title: value },
					value.length > 0 ? value : props.placeholder
				),
				open && anchor !== null
					? react.createElement(
							"div",
							{
								style: {
									...rowStyles.list,
									left: `${anchor.left}px`,
									top: `${anchor.top}px`,
									width: `${anchor.width}px`
								}
							},
							[
								react.createElement("input", {
									key: "__search",
									value: query,
									placeholder: props.searchPlaceholder,
									onChange: (event) => setQuery(event.target.value),
									style: rowStyles.search,
									autoFocus: true
								}),
								react.createElement(
									"div",
									{ key: "__default", style: rowStyles.item, onClick: () => pick("") },
									props.placeholder
								)
							].concat(
								shown.map((family) =>
									react.createElement(
										"div",
										{
											key: family,
											style: family === value ? { ...rowStyles.item, ...rowStyles.itemActive } : rowStyles.item,
											onClick: () => pick(family)
										},
										family
									)
								)
							)
						)
					: null
			);
		}

		function TokyoNightRow(props) {
			const t = (key) => {
				try {
					if (props !== null && typeof props === "object" && typeof props.t === "function") {
						const value = props.t(key);
						if (typeof value === "string" && value.length > 0) return value;
					}
				} catch {
					// fall through to the baked-in Chinese text
				}
				return typeof zh[key] === "string" ? zh[key] : key;
			};
			const useStore = typeof props.useStore === "function" ? props.useStore : () => null;
			const snapshot = useStore((state) => state) ?? {};
			const [font, setFont] = react.useState(() => (typeof snapshot.font === "string" ? snapshot.font : ""));
			const [codeFont, setCodeFont] = react.useState(() => (typeof snapshot.codeFont === "string" ? snapshot.codeFont : ""));
			// Start from the built-in catalog, then swap in what is really installed.
			const [monoFonts, setMonoFonts] = react.useState(() => MONO_FONTS);
			react.useEffect(() => {
				let cancelled = false;
				void loadSystemFonts().then((families) => {
					if (!cancelled && Array.isArray(families) && families.length > 0) setMonoFonts(families);
				});
				return () => {
					cancelled = true;
				};
			}, []);
			const chosen = typeof snapshot.chosen === "string" ? snapshot.chosen : "";
			const call = (name, argument) => {
				try {
					if (typeof props[name] === "function") props[name](argument);
				} catch {
					// runtime gone — leave the row as it is
				}
			};
			const themeButton = (id, label) =>
				react.createElement(
					"button",
					{
						type: "button",
						key: id,
						onClick: () => call("setTheme", id),
						"aria-pressed": chosen === id,
						style: { ...rowStyles.button, ...(chosen === id ? rowStyles.buttonActive : {}) }
					},
					label
				);
			const detail = `${t("row.diagnostics")}: ${snapshot.preference || "—"} · bg-base ${snapshot.bgBase || "—"} · chrome ${snapshot.chrome ? "on" : "off"} · hosts ${typeof snapshot.hosts === "number" ? snapshot.hosts : 0}/${typeof snapshot.hostTotal === "number" ? snapshot.hostTotal : 0} · frost ${typeof snapshot.frost === "number" ? snapshot.frost : 0}`;
			return react.createElement(
				"div",
				{ style: rowStyles.group },
				react.createElement("span", { style: rowStyles.title }, t("row.title")),
				react.createElement("span", { style: rowStyles.description }, t("row.description")),
				react.createElement(
					"div",
					{ style: rowStyles.buttonRow },
					react.createElement("span", { style: rowStyles.label }, t("row.theme")),
					themeButton(SKINS[0].id, t("row.themeNight")),
					themeButton(SKINS[1].id, t("row.themeDay")),
					themeButton(NATIVE_SKIN, t("row.themeNative"))
				),
				react.createElement(
					"div",
					{ style: rowStyles.buttonRow },
					react.createElement("span", { style: rowStyles.label }, t("row.acrylic")),
					react.createElement(
						"button",
						{
							type: "button",
							onClick: () => call("setAcrylic", !(snapshot.acrylic === true)),
							"aria-pressed": snapshot.acrylic === true,
							style: { ...rowStyles.button, ...(snapshot.acrylic === true ? rowStyles.buttonActive : {}) }
						},
						snapshot.acrylic === true ? t("row.acrylicOn") : t("row.acrylicOff")
					)
				),
				react.createElement(
					"div",
					{ style: rowStyles.buttonRow },
					react.createElement("span", { style: rowStyles.label }, t("row.font")),
					react.createElement(FontPicker, {
						families: monoFonts,
						value: font,
						placeholder: t("row.fontDefault"),
						searchPlaceholder: t("row.fontSearch"),
						onPick: (next) => {
							setFont(next);
							call("setFont", { font: next, codeFont });
						}
					}),
					react.createElement(
						"button",
						{
							type: "button",
							style: rowStyles.button,
							onClick: () => {
								setFont("");
								setCodeFont("");
								call("setFont", { font: "", codeFont: "" });
							}
						},
						t("row.clear")
					)
				),
				react.createElement(
					"div",
					{ style: rowStyles.buttonRow },
					react.createElement("span", { style: rowStyles.label }, t("row.codeFont")),
					react.createElement(FontPicker, {
						families: monoFonts,
						value: codeFont,
						placeholder: t("row.fontDefault"),
						searchPlaceholder: t("row.fontSearch"),
						onPick: (next) => {
							setCodeFont(next);
							call("setFont", { font, codeFont: next });
						}
					})
				),
				react.createElement("span", { style: rowStyles.description }, t("row.fontMonoHint")),
				react.createElement("span", { style: rowStyles.diagnostics }, detail)
			);
		}

		/** Row mirror store; the theme/change listener is the only writer. */
		function createRowStore() {
			return _store.defineStore({
				init: () => ({ chosen: "", preference: "", font: "", codeFont: "", acrylic: true, chrome: false, hosts: 0, hostTotal: 0, frost: 0, bgBase: "", revision: -1 }),
				actions: {
					sync: (d, payload) => {
						if (typeof payload.revision !== "number" || payload.revision <= d.revision) return;
						d.chosen = payload.chosen === null ? "" : String(payload.chosen || "");
						d.preference = typeof payload.preference === "string" ? payload.preference : "";
						d.font = typeof payload.font === "string" ? payload.font : "";
						d.codeFont = typeof payload.codeFont === "string" ? payload.codeFont : "";
						d.acrylic = payload.acrylic !== false;
						d.chrome = payload.chrome === true;
						d.hosts = typeof payload.hosts === "number" ? payload.hosts : 0;
						d.hostTotal =
							payload.hostStats !== null && typeof payload.hostStats === "object"
								? Number(payload.hostStats.matched) || 0
								: 0;
						d.frost = typeof payload.frost === "number" ? payload.frost : 0;
						d.bgBase = typeof payload.bgBase === "string" ? payload.bgBase : "";
						d.revision = payload.revision;
					}
				}
			});
		}
		//#endregion

		//#region tokyo-night: client plugin body
		/** Required services: theme runtime plus slots and locale for the row. */
		const inject = ["slots", "locale", "theme"];

		function apply(ctx) {
			try {
				applyInner(ctx);
			} catch (error) {
				// A theme plugin must never be able to take the interface down with
				// it: fail loudly in the console, leave the shell untouched.
				try {
					console.error("[tokyo-night] activation failed:", error);
				} catch {
					// console unavailable
				}
			}
		}

		function applyInner(ctx) {
			themeService = ctx.theme;

			// Register skin by skin: one bad palette must not cost the other theme.
			const disposers = [];
			for (const skin of SKINS) {
				try {
					disposers.push(ctx.theme.register(skin));
				} catch (error) {
					try {
						console.error(`[tokyo-night] skin ${skin.id} rejected:`, error);
					} catch {
						// console unavailable
					}
				}
			}
			ctx.effect(() => () => {
				for (const dispose of disposers) {
					try {
						dispose();
					} catch {
						// already disposed
					}
				}
			}, "tokyo-night: theme registration");

			const rowStore = createRowStore();
			let rowActions = null;
			let revision = 0;

			const syncRow = (next) => {
				if (rowActions === null) return;
				try {
					rowActions.sync({
						chosen: readChosen(),
						preference: preferenceOf(),
						font: readFont("font"),
						codeFont: readFont("code"),
						acrylic: readAcrylic(),
						chrome: isChromeMounted(),
						hosts: blurHostCount,
						hostStats: blurHostStats,
						frost: frostCount,
						panels: panelsCount,
						fontSource: fontSource,
						fontCount: fontCount,
						frostTargets: frostTargets.slice(0, 6),
						bgBase: readComputedSurfaces().bgBase,
						revision: typeof next === "number" ? next : (revision += 1)
					});
				} catch {
					// store disposed
				}
			};

			let reportTimer = null;
			const scheduleReport = () => {
				if (reportTimer !== null) clearTimeout(reportTimer);
				reportTimer = setTimeout(() => {
					reportTimer = null;
					void report();
				}, REPORT_DEBOUNCE_MS);
			};
			/* Expose the debounced reporter to the module-scope re-arm timer. */
			reportRequest = scheduleReport;

			/** Theme choice, acrylic layer and font override applied together. */
			const sync = () => {
				syncChrome(isOursActive());
				syncFont(readFont("font"), readFont("code"), isOursActive());
			};

			ctx.on("theme/change", (snapshot) => {
				sync();
				revision += 1;
				syncRow(typeof snapshot === "object" && snapshot !== null && typeof snapshot.revision === "number" ? snapshot.revision : revision);
				scheduleReport();
			});

			ctx.effect(
				() =>
					ctx.locale.register(SETTINGS_NS, {
						zh,
						en
					}),
				"tokyo-night: settings dictionaries"
			);
			ctx.slots.inject("settings.general.item", () =>
				ctx.slots.register(
					{
						name: "settings.general.item",
						id: ROW_ID,
						order: 20,
						label: "Tokyo Night",
						store: rowStore,
						locale: SETTINGS_NS,
						inject: (actions) => {
							rowActions = actions;
							syncRow(revision);
							return {
								setTheme: (id) => {
									persist({ chosen: id });
									try {
										ctx.theme.setTheme(id);
									} catch {
										// runtime not ready — the choice is stored anyway
									}
									sync();
									syncRow((revision += 1));
								},
								setFont: (payload) => {
									const next = payload !== null && typeof payload === "object" ? payload : {};
									persist({ font: String(next.font || ""), codeFont: String(next.codeFont || "") });
									sync();
									syncRow((revision += 1));
								},
								setAcrylic: (on) => {
									persist({ acrylic: on === true });
									sync();
									syncRow((revision += 1));
								}
							};
						}
					},
					TokyoNightRow
				)
			);

			/** Boot: honour the stored choice, else fall back to the default skin. */
			const applyChosen = () => {
				const chosen = readChosen();
				try {
					if (typeof chosen === "string" && chosen.length > 0) {
						if (preferenceOf() !== chosen) ctx.theme.setTheme(chosen);
					} else if (!isOursActive()) {
						ctx.theme.setTheme(DEFAULT_SKIN);
					}
				} catch {
					// runtime not ready — the second pass retries
				}
			};

			applyChosen();
			const bootTimer = setTimeout(() => {
				applyChosen();
				sync();
				syncRow((revision += 1));
				scheduleReport();
			}, REASSERT_DELAY_MS);

			hydrate().then(() => {
				applyChosen();
				sync();
				syncRow((revision += 1));
				scheduleReport();
			});

			ctx.effect(() => () => {
				clearTimeout(bootTimer);
				if (reportTimer !== null) clearTimeout(reportTimer);
				syncChrome(false);
				unmountStyle("font");
				styleElements.chrome = null;
				styleElements.font = null;
			}, "tokyo-night: acrylic layer");
		}
		//#endregion

		exports.SKINS = SKINS;
		exports.ACRYLIC = ACRYLIC;
		exports.ACRYLIC_ENABLED = ACRYLIC_ENABLED;
		exports.BASE_CSS = BASE_CSS;
		exports.CHROME_CSS = CHROME_CSS;
		exports.HOST_SELECTORS = HOST_SELECTORS;
		exports.HOST_ATTRIBUTE = HOST_ATTRIBUTE;
		exports.FROST_SELECTORS = FROST_SELECTORS;
		exports.FROST_ATTRIBUTE = FROST_ATTRIBUTE;
		exports.MONO_FONTS = MONO_FONTS;
		exports.MONO_FONT_BASES = MONO_FONT_BASES;
		exports.MONO_FONT_SUFFIXES = MONO_FONT_SUFFIXES;
		exports.PANEL_SELECTORS = PANEL_SELECTORS;
		exports.PANEL_ATTRIBUTE = PANEL_ATTRIBUTE;
		exports.DEFAULT_SKIN = DEFAULT_SKIN;
		exports.NATIVE_SKIN = NATIVE_SKIN;
		exports.ROW_ID = ROW_ID;
		exports.STATE_ROUTE = STATE_ROUTE;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
