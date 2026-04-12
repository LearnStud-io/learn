// Shared colour palette for vis files.
// Copy into a <script> block — not imported, inlined at authoring time.
//
// Usage:
//   s.background(...P.bg)
//   s.fill(...P.surface)
//   s.fill(...P.accent)

const P = {
  bg:      [8,  13,  20],   // #080d14 — iframe background
  surface: [20, 30,  50],   // dark card / track background
  border:  [30, 42,  65],   // subtle borders
  muted:   [90, 108, 135],  // secondary labels
  text:    [200,215, 235],  // primary text
  accent:  [59, 130, 246],  // #3b82f6 blue — product bars, highlights
  green:   [74, 222, 128],  // HIGH badge
  red:     [248,113, 113],  // LOW badge
  greenBg: [20, 83,  45],   // HIGH badge background
  redBg:   [69, 10,  10],   // LOW badge background
}

// Dimension colours used when a vis has 3 feature dimensions
// (animal / royal / abstract, or any 3-quality breakdown)
const DIM_RGB = [
  [249, 115, 22],   // orange  — dim 0
  [168,  85,247],   // purple  — dim 1
  [ 99, 102,241],   // indigo  — dim 2
]
