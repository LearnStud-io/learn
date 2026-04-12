// Animation helpers for p5-based vis files.
// Copy into a <script> block — not imported, inlined at authoring time.

// ── easing ────────────────────────────────────────────────────────────────────

function easeInOut(t) { return t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t }
function easeOut(t)   { return 1 - (1 - t) * (1 - t) }

// ── lerp-based animation state ────────────────────────────────────────────────
// Pattern used when animating between two states (e.g. toggling pairs):
//
//   let startVals = [...initialValues]
//   let lerpedVals = [...initialValues]
//   let animT = 1
//
//   function switchTo(newValues) {
//     startVals = [...lerpedVals]   // snapshot current animated position
//     targetVals = newValues
//     animT = 0
//   }
//
//   // inside p5 draw():
//   if (animT < 1) animT = Math.min(1, animT + ANIM_SPEED)
//   const e = easeInOut(animT)
//   for (let i = 0; i < n; i++) {
//     lerpedVals[i] = startVals[i] + (targetVals[i] - startVals[i]) * e
//   }

const ANIM_SPEED = 0.045   // ~22 frames to complete at 60fps; feels snappy but not jarring
