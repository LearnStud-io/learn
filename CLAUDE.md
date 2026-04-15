# Course Context

**Course:** Mechanistic Interpretability — A Builder's Guide
**Approach:** Top-down, builder-first — each stage produces a working tool before diving into theory
**Learner profile:** Fullstack developer with CS degree; knows basic linear algebra and calculus; learns by doing; goal is to build tools for exploring AI internals

### The 5-stage roadmap

| Stage | Label | What you build |
|-------|-------|---------------|
| 1 | The Explorer | Token/logit viewer — first window into a model |
| 2 | The Anatomy | Logit lens — watch predictions form layer by layer |
| 3 | The Surgeon | Activation patching tool — trace which head does what |
| 4 | The Archaeologist | Sparse autoencoder + feature explorer |
| 5 | The Cartographer | Circuit graph visualizer — map full component composition |

### Data fields

`metadata.json` supports `title`, `subtitle`, `version`, `overview`, and `goal`.
`overview` and `goal` are displayed in the left sidebar of the roadmap page.

---

# LearnStudio Course Authoring

You are helping create a course for LearnStudio — a platform that renders structured learning roadmaps with interactive lessons.

A course is entirely defined by local files. When ready, `npm run publish` sends everything to the platform.

## Before you do anything

Look at the context first:
- If the user is starting a new course — ask: **"What do you want to learn or teach? Describe the topic and who it's for."** Wait for their answer before generating any files.
- If the user is mid-course (editing content, asking to "visualise this", updating a vis) — skip this and go directly to the relevant workflow.

Use the topic description to shape the course title, subtitle, roadmap structure, and lesson content.

---

## File structure

```
src/modules/data/
  metadata.json                  ← course title, subtitle, version
  roadmap.json                   ← topics and their dependencies
  lessons/
    <node-id>/
      lesson.json                ← content for that topic
      vis/
        <name>.html              ← optional interactive visualisations
```

One folder per roadmap node that has lesson content. The folder name must exactly match the node's `id` in `roadmap.json`.

---

## metadata.json

```json
{
  "title": "Binary Search Trees",
  "subtitle": "From fundamentals to balanced trees",
  "version": "0.1.0",
  "goal": "What will the learner be able to do by the end?",
  "overview": "A short description of what this course is about and why it matters."
}
```

`goal` and `overview` are optional but recommended — they appear in the sidebar alongside the roadmap.

---

## roadmap.json

Defines the topics and the dependency graph rendered as a visual roadmap.

```json
{
  "nodes": [
    {
      "id": "intro",
      "label": "Introduction",
      "description": "What is a BST and why does it matter",
      "dependsOn": []
    },
    {
      "id": "insertion",
      "label": "Insertion",
      "description": "Adding nodes while maintaining BST property",
      "dependsOn": ["intro"]
    },
    {
      "id": "search",
      "label": "Search",
      "description": "Finding a value in O(log n)",
      "dependsOn": ["intro"]
    },
    {
      "id": "deletion",
      "label": "Deletion",
      "description": "Removing nodes and rebalancing",
      "dependsOn": ["insertion", "search"]
    }
  ]
}
```

**Rules:**
- `id` — kebab-case, unique, never change it after first publish (it is the stable key)
- `dependsOn` — must reference existing node IDs; empty array `[]` for root nodes
- The graph must be a DAG (no cycles)

---

## lesson.json

Content for one roadmap node. A tree of sections, each with content blocks.

```json
{
  "nodes": [
    {
      "slug": "what-is-a-bst",
      "title": "What is a BST?",
      "blocks": [
        {
          "type": "text",
          "content": "A Binary Search Tree is a node-based data structure where each node has at most two children. For any node, all values in its left subtree are smaller, and all values in its right subtree are larger."
        },
        {
          "type": "vis",
          "file": "vis/bst-structure.html",
          "caption": "A valid BST — left subtree values are always smaller"
        }
      ],
      "children": [
        {
          "slug": "what-is-a-bst-properties",
          "title": "Key properties",
          "blocks": [
            {
              "type": "text",
              "content": "1. Left child < parent < right child\n2. Each subtree is itself a valid BST\n3. No duplicate values (by convention)"
            }
          ],
          "children": []
        }
      ]
    },
    {
      "slug": "why-bst",
      "title": "Why use a BST?",
      "blocks": [
        {
          "type": "text",
          "content": "BSTs give us O(log n) search, insertion, and deletion on average — much faster than scanning a list. They also keep data sorted, making in-order traversal trivial."
        }
      ],
      "children": []
    }
  ]
}
```

**Rules:**
- `slug` — kebab-case, unique within the entire lesson file, never change after first publish
- `title` — the section heading shown in the sidebar and content area
- `blocks` — ordered list of content blocks; can be empty `[]`
- `children` — nested subsections; can be empty `[]`; nesting can go as deep as needed
- Block type `text` — plain text content, use `\n` for line breaks; supports LaTeX math via KaTeX (see **Math in text blocks** below)
- Block type `vis` — references an HTML file in the `vis/` folder; `caption` is optional; `height` is optional (integer px, defaults to 280) — set it when the vis needs more or less vertical space

---

## Math in text blocks

Text blocks support LaTeX math rendered by KaTeX. Use standard delimiters:

- **Inline math** — wrap in single `$`: `the gradient $\nabla L$ points uphill`
- **Display math** — wrap in double `$$` on its own line:

```
$$
\text{cosine similarity} = \frac{a \cdot b}{\|a\| \times \|b\|}
$$
```

The renderer detects the `$` delimiter automatically — no block type change needed. If your text contains a literal dollar sign (e.g. a price), escape it: `\$5.99`.

Common patterns for this course:
- Partial derivative: `$\frac{\partial L}{\partial W_{ij}}$`
- Matrix multiply: `$W \in \mathbb{R}^{512 \times 50000}$`
- Norm: `$\|a\|$`
- Dot product: `$a \cdot b$`
- Update rule: `$W \leftarrow W - \alpha \nabla L$`

---

## vis HTML files

Self-contained HTML files rendered in a sandboxed iframe. Used for interactive diagrams, animations, and visualisations.

```html
<!doctype html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #080d14;
    font-family: system-ui, sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    color: #e2e8f0;
  }
</style>
</head>
<body>
  <!-- your visualisation here -->
  <script>
    // use p5.js or Three.js (see Technology choice below), or vanilla JS
  </script>
</body>
</html>
```

**Rules:**
- No `fetch()` calls, no external resources except the two allowed libraries below
- Use the dark background `#080d14` to match the platform theme
- Use accent colour `#3b82f6` (blue) for highlights
- Use text colour `#e2e8f0` for primary text, `#64748b` for muted text
- The iframe is `width: 100%` and defaults to `height: 280px` — design for whatever height you set in the `vis` block's `height` field (omit for 280px default)
- Always include a brief interaction hint inside the vis (e.g. a small fixed label: "← toggle", "drag to rotate", "hover a node") so the learner knows what to do

**Technology choice — evaluate before writing code:**
- **Three.js** — use when 3D genuinely aids understanding (e.g. high-dimensional spaces, rotatable geometry, depth perception). Load via CDN:
  `<script src="https://cdn.jsdelivr.net/npm/three@0.160/build/three.min.js"></script>`
  Do NOT load `examples/js/controls/OrbitControls.js` — it was removed in r152. Use the spherical orbit from `three/setup.html` instead.
- **p5.js** — use for animated 2D diagrams, step-by-step illustrations, interactive charts. Load via CDN:
  `<script src="https://cdn.jsdelivr.net/npm/p5@1.9.4/lib/p5.min.js"></script>`
- **Vanilla JS** — acceptable for simple static layouts (bar charts, toggle panels) where animation adds no insight

---

## Publishing

```bash
npm run publish
```

- First publish: creates the course on the platform, saves the course ID to `.env`
- Subsequent publishes: diffs against what's already on the platform and only writes what changed
- Requires `LEARNSTUDIO_API_KEY` in `.env`

---

## Workflow for creating a course

1. Edit `metadata.json` — set the course title and subtitle
2. Edit `roadmap.json` — define all topics and their dependencies
3. **Get explicit user approval on the roadmap before writing any lesson content.** Show the node list and ask: "Does this look right before we fill in the lessons?"
4. For each topic, create the lesson in three passes — do not skip ahead:
   - **Pass 1 — Structure:** Create `lesson.json` with all sections and slugs. Blocks are empty `[]`. Get approval.
   - **Pass 2 — Content:** Fill in `text` blocks with actual content. No visualisations yet. Get approval.
   - **Pass 3 — Visualisations:** For each vis, follow the full "Visualise this" workflow: read INDEX.md → choose technology → create HTML using primitives → screenshot and verify → update primitives if improved.
5. Run `npm run publish`

**Do not create lesson files until the roadmap is finalised and approved.** The node `id` is a stable key — changing it after lessons exist breaks the course.

**Do not add content or visualisations until the structure pass is approved.** Build in order: structure → content → visualisations.

---

## "Visualise this" workflow

The user pastes a sentence or paragraph from a lesson and says "visualise this" (or similar).

**What to do:**

1. **Read `src/vis-primitives/INDEX.md`** — before writing any code, check what exists and which technology fits. Do not skip this step.

2. **Find the sentence** in `lesson.json` — identify which `text` block it lives in and exactly where within it.

3. **Split the text block** at that sentence — break the single `content` string into two parts: everything up to and including the sentence stays in the first block, everything after goes in a new `text` block.

4. **Insert a `vis` block between them** with a `prompt` field storing the original sentence:
   ```json
   { "type": "text", "content": "...everything up to the sentence." },
   { "type": "vis", "file": "vis/<name>.html", "caption": "...", "prompt": "The exact sentence the user pasted" },
   { "type": "text", "content": "Everything after the sentence..." }
   ```

5. **Choose the technology** — ask: does 3D genuinely help the learner grasp this concept? If yes, use Three.js. If not, use p5.js for animation or vanilla JS for simple layouts.

6. **Create the HTML file** at `src/modules/data/lessons/<node-id>/vis/<name>.html`. Read the relevant primitive files and inline them. Follow all vis rules. Include an in-vis interaction hint label.

7. **Screenshot and verify** — run the screenshot tool and read the image before considering it done:
   ```bash
   node scripts/screenshot-vis.mjs <node-id> <vis-filename> [height]
   ```
   Pass the `height` if the vis block has a custom height (e.g. `360`). Defaults to 280 if omitted.
   The screenshot is saved to `vis/.screenshots/<name>.png`. Read it with the Read tool. Fix and re-run until the layout looks right.

The `prompt` field is authoring metadata — the platform ignores it, but it records exactly what the vis is supposed to illustrate. Use it as the brief when creating or editing the HTML file.

---

## Screenshotting a vis

Every vis must be screenshotted and verified before it is done — see step 7 of the "Visualise this" workflow above for the full instructions. `npm run dev` installs playwright automatically; no extra setup needed.

---

## Primitives

`src/vis-primitives/` is part of this repo — always available locally, no sibling repo needed.

```
vis-primitives/
  INDEX.md        ← read this first before writing any vis
  p5/
    setup.html    ← shell: buttons, canvas, resize, hint footer
    palette.js    ← P{} colour constants, DIM_RGB
    animate.js    ← easeInOut, ANIM_SPEED, lerp-animation pattern
    drawing.js    ← drawVBar, drawProdBar, drawBadge, drawColGlow, drawHint
  three/
    setup.html    ← shell: renderer, camera, OrbitControls, resize, animate loop
```

**After confirming the vis looks right:**
- Re-read each primitive file you inlined. Compare your implementation to the canonical version — did you write a better version of anything? If yes, update that file with the improvement.
- Did you write anything reusable that isn't in primitives yet? If yes, add it to the right file.
- **If you touched any primitive file** — update `INDEX.md` unconditionally. Do not skip this.
- If `PRIMITIVES=true` — push `learn` so creators get the update.
- If `PRIMITIVES=false` — do not modify primitives. Read only.

---

## Visualisation design principles

- One insight per visualisation — resist adding more
- Use animation to show transitions, not just end states
- Colour-code groups consistently (same colour = same category)
- Caption describes what to *notice*, not what is shown
- Interactive when possible — the user should explore, not just observe
- Always show a brief in-vis instruction (what to click, drag, or hover) — never leave the learner guessing how to interact
- Always give the first element (buttons/title) at least 10–12px from the top edge, and the last element (hint text) at least 10px from the bottom edge — never let UI elements sit flush against the canvas border
- Prefer 3D (Three.js) only when depth or rotation reveals something 2D cannot — otherwise p5.js or vanilla JS is simpler and loads faster

### Text contrast on the dark background (`#080d14`)

Use this hierarchy — never go darker than `#475569` for text the learner needs to read:

| Role | Colour |
|------|--------|
| Primary values / numbers the learner watches | `#cbd5e1` |
| Secondary labels (angle, formula breakdown) | `#94a3b8` |
| Muted / supporting text | `#64748b` |
| Hint footer | `#475569` |

Avoid `#334155` or darker for any readable text — it blends into the background.

### Reset button

Any explorer-style vis where the learner edits values should include a reset button that restores the preset for the current state. Style it as a secondary action — lighter border and muted colour — placed alongside the main toggle buttons but visually distinct (e.g. `↺ reset`).
