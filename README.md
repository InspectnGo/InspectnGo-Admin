# InspectnGO Admin Dashboard

Internal admin dashboard for managing mechanic verification, viewing mechanic documents, and monitoring landing page signups.

## Prerequisites

- Node.js 18+
- The [InspectnGo-Server](../InspectnGo-Server) running locally with `ADMIN_API_KEY` set in `.env`

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Opens at [http://localhost:5173](http://localhost:5173).

Log in with the `ADMIN_API_KEY` value from your server's `.env` file.

## Build

```bash
npm run build
```

Output is in `dist/`.

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- TanStack React Query
- React Router
