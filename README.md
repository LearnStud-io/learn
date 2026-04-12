# LearnStudio

Write your course in plain files. Push to publish. Learners get an interactive roadmap and lesson experience.

## Setup

```bash
git clone https://github.com/LearnStud-io/learn my-course
cd my-course
npm install
npm run dev     # http://localhost:3002
```

Get an API key at [create.learnstud.io](https://create.learnstud.io), add it to `.env`:

```
LEARNSTUDIO_API_KEY=your-key
```

## Workflow

1. Edit `src/modules/data/metadata.json` — course title and subtitle
2. Edit `src/modules/data/roadmap.json` — topics and dependencies
3. Add `src/modules/data/lessons/<node-id>/lesson.json` for each topic
4. Run `npm run publish`
