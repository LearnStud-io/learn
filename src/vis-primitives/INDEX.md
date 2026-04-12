# Vis Primitives — Quick Reference

Read this file first before writing any vis. It tells you what exists and when to use it.

---

## Technology choice

| Use | When |
|-----|------|
| `p5/` | 2D animated diagrams, bar charts, step-by-step illustrations, anything interactive that doesn't need depth |
| `three/` | 3D rotation reveals something 2D cannot — high-dimensional spaces, geometric relationships, depth perception |
| Vanilla JS | Simple static layouts with no animation (rare — prefer p5 if animation would help) |

---

## p5 primitives

### `p5/setup.html`
**Use this as the starting shell for every p5 vis.**
Includes: buttons (absolute, z-index:10), canvas creation, `windowResized`, hint footer at bottom, `system-ui` font set.

### `p5/palette.js`
**Use whenever you need colours.**
- `P.bg`, `P.surface`, `P.border` — backgrounds and tracks
- `P.muted`, `P.text` — label colours
- `P.accent` — blue (#3b82f6) for bars, highlights
- `P.green` / `P.red` / `P.greenBg` / `P.redBg` — HIGH/LOW badge colours
- `DIM_RGB` — 3-element array of [orange, purple, indigo] for feature-dimension colouring (animal/royal/abstract or any 3-quality breakdown)

### `p5/animate.js`
**Use whenever values transition between states (toggle, step-through).**
- `easeInOut(t)` — smooth in and out
- `easeOut(t)` — fast start, slow landing
- `ANIM_SPEED = 0.045` — standard speed (~22 frames)
- Lerp pattern in comments: snapshot startVals → set animT=0 → advance in draw()

### `p5/drawing.js`
**Use for common shapes. Requires `P` and `DIM_RGB` from palette.js in scope.**
- `drawVBar(s, x, y, w, maxH, value, rgb, opts)` — vertical filled bar in a dark track; supports `brightH` option for overlap/shared-height highlight
- `drawProdBar(s, cx, y, w, value)` — horizontal blue contribution bar (0–1)
- `drawBadge(s, isHigh, x, y)` — HIGH (green) or LOW (red) badge
- `drawColGlow(s, x, y, w, h, rgb, intensity)` — column background glow, intensity 0–1
- `drawHint(s, text)` — footer hint text at bottom of canvas

---

## three primitives

### `three/setup.html`
**Use this as the starting shell for every Three.js vis.**
Includes: `WebGLRenderer` with alpha, `PerspectiveCamera`, `OrbitControls` (drag/zoom), resize handler, animate loop skeleton, buttons, hint label.

---

## What's NOT here yet (write from scratch, extract after if reusable)

- Text labels in 3D (Three.js `Sprite` or CSS2DRenderer)
- Step-through / next-button pattern (multi-step walkthroughs)
- Node + edge graph layout
- Heatmap / grid cell drawing
