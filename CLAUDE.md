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
    // vanilla JS only — no external imports
  </script>
</body>
</html>
```

**Rules:**
- Must be fully self-contained — no external CDN links, no `fetch()` calls
- Use the dark background `#080d14` to match the platform theme
- Use accent colour `#3b82f6` (blue) for highlights
- Use text colour `#e2e8f0` for primary text, `#64748b` for muted text
- Vanilla JS only — no frameworks, no imports
- The iframe is `width: 100%, height: 280px` — design for that viewport

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
3. For each topic, create `lessons/<node-id>/lesson.json` with the content
4. For any vis blocks, create the corresponding `lessons/<node-id>/vis/<name>.html`
5. Run `npm run publish`

Start with the roadmap — get all topics and dependencies right first, then fill in the lesson content.
