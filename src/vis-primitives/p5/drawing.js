// Reusable p5 drawing helpers for vis files.
// Copy into a <script> block alongside palette.js — not imported, inlined.
// Assumes `P` and `DIM_RGB` from palette.js are in scope.
// Assumes p5 sketch variable is `s`.

// ── vertical bar ─────────────────────────────────────────────────────────────
// Draws a filled vertical bar inside a dark track.
// value: 0–1, maxH: pixel height of track
// brightH (optional): highlight only the bottom portion (e.g. shared/overlap height)
function drawVBar(s, x, y, w, maxH, value, rgb, { alpha=220, brightH=null } = {}) {
  const fillH = value * maxH
  s.fill(...P.surface)
  s.rect(x, y, w, maxH, 3)
  if (brightH !== null) {
    // dim top portion (value above shared)
    if (fillH > brightH) {
      s.fill(...rgb, 65)
      s.rect(x, y + maxH - fillH, w, fillH - brightH, 3, 3, 0, 0)
    }
    // bright bottom portion (shared with other word)
    if (brightH > 0) {
      s.fill(...rgb, alpha)
      s.rect(x, y + maxH - brightH, w, brightH, 0, 0, 3, 3)
    }
  } else {
    s.fill(...rgb, alpha)
    s.rect(x, y + maxH - fillH, w, fillH, 3)
  }
}

// ── product / contribution bar ────────────────────────────────────────────────
// Horizontal bar representing a dot-product contribution (0–1).
function drawProdBar(s, cx, y, w, value) {
  s.fill(...P.surface)
  s.stroke(...P.border)
  s.strokeWeight(1)
  s.rect(cx - w/2, y, w, 9, 3)
  s.noStroke()
  s.fill(...P.accent, 220)
  s.rect(cx - w/2, y, w * Math.min(value, 1), 9, 3)
}

// ── HIGH / LOW badge ──────────────────────────────────────────────────────────
// Draws the coloured badge right of a score value.
// isHigh: boolean, x/y: top-left of badge rect
function drawBadge(s, isHigh, x, y) {
  const [sR,sG,sB] = isHigh ? P.green : P.red
  const [bR,bG,bB] = isHigh ? P.greenBg : P.redBg
  s.noStroke()
  s.fill(bR, bG, bB)
  s.rect(x, y, 40, 18, 4)
  s.fill(sR, sG, sB)
  s.textSize(10)
  s.textAlign(s.CENTER, s.CENTER)
  s.text(isHigh ? 'HIGH' : 'LOW', x + 20, y + 9)
}

// ── column glow ───────────────────────────────────────────────────────────────
// Background glow for a dimension column, intensity = contribution (0–1).
function drawColGlow(s, x, y, w, h, rgb, intensity) {
  s.noStroke()
  s.fill(...rgb, intensity * 115)
  s.rect(x + 10, y, w - 20, h, 10)
}

// ── footer hint ───────────────────────────────────────────────────────────────
function drawHint(s, text) {
  s.noStroke()
  s.fill(45, 58, 80)
  s.textSize(9)
  s.textAlign(s.CENTER, s.BOTTOM)
  s.text(text, s.width / 2, s.height - 3)
}
