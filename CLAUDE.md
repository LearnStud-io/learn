# LearnStudio Course Authoring

You are helping create a course for LearnStudio — a platform that renders structured learning roadmaps with interactive lessons.

A course is entirely defined by local files. When ready, `npm run publish` sends everything to the platform.

## Before you do anything

Ask the user: **"What do you want to learn or teach? Describe the topic and who it's for."**

Wait for their answer before generating any files. Use their response to shape the course title, subtitle, roadmap structure, and lesson content.

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
  "version": "0.1.0"
}
```

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
- Block type `text` — plain text content, use `\n` for line breaks
- Block type `vis` — references an HTML file in the `vis/` folder; `caption` is optional

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
- The iframe is `width: 100%, height: 280px` — design for that viewport
- Always include a brief interaction hint inside the vis (e.g. a small fixed label: "← toggle", "drag to rotate", "hover a node") so the learner knows what to do

**Technology choice — evaluate before writing code:**
- **Three.js** — use when 3D genuinely aids understanding (e.g. high-dimensional spaces, rotatable geometry, depth perception). Load via CDN:
  `<script src="https://cdn.jsdelivr.net/npm/three@0.160/build/three.min.js"></script>`
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
   - **Pass 3 — Visualisations:** Add `vis` blocks and create the corresponding `.html` files.
5. Run `npm run publish`

**Do not create lesson files until the roadmap is finalised and approved.** The node `id` is a stable key — changing it after lessons exist breaks the course.

**Do not add content or visualisations until the structure pass is approved.** Build in order: structure → content → visualisations.

---

## "Visualise this" workflow

The user pastes a sentence or paragraph from a lesson and says "visualise this" (or similar).

**What to do:**

1. **Find the sentence** in `lesson.json` — identify which `text` block it lives in and exactly where within it.

2. **Split the text block** at that sentence — break the single `content` string into two parts: everything up to and including the sentence stays in the first block, everything after goes in a new `text` block.

3. **Insert a `vis` block between them** with a `prompt` field storing the original sentence:
   ```json
   { "type": "text", "content": "...everything up to the sentence." },
   { "type": "vis", "file": "vis/<name>.html", "caption": "...", "prompt": "The exact sentence the user pasted" },
   { "type": "text", "content": "Everything after the sentence..." }
   ```

4. **Choose the technology** — ask: does 3D genuinely help the learner grasp this concept? If yes, use Three.js. If not, use p5.js for animation or vanilla JS for simple layouts.

5. **Create the HTML file** at `src/modules/data/lessons/<node-id>/vis/<name>.html`. Follow all vis rules. Include an in-vis interaction hint label.

6. **Screenshot and verify** — run the screenshot tool and read the image before considering it done:
   ```bash
   node scripts/screenshot-vis.mjs <node-id> <vis-filename>
   ```
   The screenshot is saved to `vis/.screenshots/<name>.png`. Read it with the Read tool. Fix and re-run until the layout looks right.

The `prompt` field is authoring metadata — the platform ignores it, but it records exactly what the vis is supposed to illustrate. Use it as the brief when creating or editing the HTML file.

---

## Screenshotting a vis

After writing any vis, run the screenshot tool and read the image before considering it done:
```bash
node scripts/screenshot-vis.mjs <node-id> <vis-filename>
# e.g. node scripts/screenshot-vis.mjs math-to-nn dot-product.html
```
The screenshot is saved to `vis/.screenshots/<name>.png`. Read it with the Read tool. If the layout looks wrong — clipping, bad font sizes, glow too faint — fix and re-run. Iterate until it looks right.

No extra setup needed — `npm run dev` installs the playwright chromium binary automatically for everyone.

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

**Before writing a new vis:** read `src/vis-primitives/INDEX.md` — it tells you what exists and when to use each primitive. Then read the specific files that apply and inline their contents into the vis. Do not rewrite what already exists.

**After finishing a vis:** look back at what you wrote and ask: is any of this worth saving or improving for next time?
- If `PRIMITIVES=true` — add new helpers or update existing ones in `src/vis-primitives/`, update `INDEX.md`, then push `learn`. Creators who pull will get the latest.
- If `PRIMITIVES=false` — do not update primitives. Read only.

---

## Visualisation design principles

- One insight per visualisation — resist adding more
- Use animation to show transitions, not just end states
- Colour-code groups consistently (same colour = same category)
- Caption describes what to *notice*, not what is shown
- Interactive when possible — the user should explore, not just observe
- Always show a brief in-vis instruction (what to click, drag, or hover) — never leave the learner guessing how to interact
- Prefer 3D (Three.js) only when depth or rotation reveals something 2D cannot — otherwise p5.js or vanilla JS is simpler and loads faster
