# Tempo

Tempo is a local-first task manager focused on quick capture and calm daily planning.

## Features

- Add tasks with a natural-language quick-add field. Supported patterns include `today`, `tomorrow`, `next week`, `in 3 days`, weekdays, `for 90m`, `#tags`, `@projects`, and priorities `p1`–`p4`.
- Organize tasks by project and area, with due dates, estimates, priorities, and tags.
- Search and filter tasks by all, today, upcoming, or completed.
- Keep tasks in browser `localStorage`; no account or server is required.
- Responsive interface built with React, TypeScript, Vite, and Tailwind CSS.

## Requirements

- Node.js 20 or newer
- npm

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite.

## Checks

```sh
npm run lint
npm test
npm run build
```

## Data and limitations

Tasks are stored in the browser on the current device. Clearing site data removes them; this version does not yet provide cloud sync, import/export, or multi-device backup.
