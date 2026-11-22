# Ankit Verma — Portfolio

A dark, animated, responsive portfolio for presenting Ankit’s work, education, community involvement, learning record, and contact information. The public experience is built with React, Vite, Motion, and Lucide. Vercel Node.js functions provide the private message inbox, admin sign-in, and lightweight page-view analytics.

## Run locally

Requires Node.js 20.19 or newer. Install packages once with npm:

```powershell
npm install
```

Start the complete local site, including its API functions:

```powershell
npm run dev
```

The Vite development server uses a local adapter for the same API handlers that Vercel runs in production. Keep the terminal open while using the site; press `Ctrl+C` to stop it. No Vercel sign-in is needed for local development.

## Configure the private inbox and dashboard

The portfolio form stores notes in a Neon PostgreSQL database. It does not send email. Ankit can read notes at `/login` and use a message’s **Reply** button to respond from their email client.

### 1. Connect a database

In the existing Vercel project, connect a Neon database through the [Vercel Neon integration](https://vercel.com/integrations/neon). Make sure it adds a `DATABASE_URL` environment variable to the project. The API creates its required tables on first use; no SQL setup step is needed.

For local work, add the same `DATABASE_URL` to `.env.local`. Keep the connection string private.

### 2. Create the admin credentials

Run this in an interactive PowerShell terminal. This command uses Node directly, so no package manager is needed:

```powershell
node scripts/setup-admin.mjs
```

Choose a username and a unique password of at least 10 characters. Longer random passwords are safer; the prompt masks what you type. The script generates a per-password salt, an OWASP-aligned scrypt hash using a 32 MiB work factor, and a random session secret, then saves `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, and `SESSION_SECRET` in `.env.local`. It never writes the plain password to a file.

For the live Vercel project, add these four environment variables in **Project Settings → Environment Variables**:

- `DATABASE_URL` — from the Neon integration
- `ADMIN_USERNAME` — the username you chose
- `ADMIN_PASSWORD_HASH` — from the generated `.env.local`
- `SESSION_SECRET` — from the generated `.env.local`

Add them to Production and Preview environments as appropriate, then redeploy. After the local database URL is set, `npm run dev` can run the same features locally. Visit `http://localhost:5173/login` or append `/login` to the deployed portfolio URL.

## How the page works

The public portfolio is a single-page application. Navigation moves between sections, the active item follows the section in view, the mobile navigation collapses into a menu button, and a slim progress line follows scroll position.

### Page sections

- **Home:** introduces Ankit and his interests in AI, machine learning, and systems. The portrait card includes the open-to-work status and links to the contact section.
- **Areas of interest:** a moving strip highlights the site’s technical topics.
- **Point of view:** describes Ankit’s approach to computer science and the areas he is exploring.
- **Selected work:** presents projects and their descriptions, tags, repositories, and live-site links.
- **Education and involvement:** shows education history, open-source work, and community roles.
- **Field notes:** displays certificates, events, and community work. Filters switch between all records, learning, events, and community. Selecting an image opens a larger view; click outside it or press `Escape` to close.
- **Contact:** contains a direct email link, social links, location details, and the “Leave a note” form.

### Leave a note

The form accepts a name, reply email, and message. A same-origin API validates the fields, applies a honeypot and rate limit, and saves the note to the private database inbox. The form does not use FormSubmit and does not send an email. A successful submission is confirmed on the page; the dashboard lets Ankit read and mark notes as read, and the reply link opens an email draft.

### Private dashboard and page views

`/login` serves the dashboard shell, but its data APIs require a valid server-verified session. The username is compared on the server, the password is verified against a salted scrypt hash, and the browser receives an `HttpOnly`, `SameSite=Strict` session cookie (`Secure` and host-only on HTTPS). Login attempts are rate-limited by source and account. The dashboard shows note counts and messages, section-view totals, and recent section views.

Analytics record section names and timestamps only. The dashboard does not identify unique people, and raw visitor IP addresses are not stored. A keyed anti-spam token is kept temporarily for rate limiting and cleaned up after 24 hours. Page counts are section opens, not a count of distinct visitors.

`.gitignore` excludes environment files, Vercel’s local project metadata, build output, and local database exports. It prevents these files from being committed by Git; it does not hide public source code or secure a browser-only password check. Authentication, sessions, and message reads are enforced by server-side functions.

## Motion and accessibility

Motion animates the hero entrance, section reveals, floating details, hover states, scrolling ticker, archive filtering, and image viewer. The pointer glow is only enabled for fine-pointer devices. Motion respects reduced-motion preferences. The page also includes a keyboard skip link, visible focus styles, labelled form inputs, and live announcements for form status.

## Project structure

```text
.
├── api/
│   ├── _lib/                  # Database, sessions, validation, and rate limiting
│   ├── admin.js               # Authenticated dashboard data and message status
│   ├── analytics.js           # Aggregate section-view recording
│   ├── auth.js                # Login, session check, and logout
│   └── messages.js            # Public note validation and storage
├── scripts/
│   └── setup-admin.mjs        # Local credential and session-secret generator
├── src/
│   ├── main.jsx               # Portfolio and /login route selection, analytics
│   ├── App.jsx                # Public portfolio and note form
│   ├── Admin.jsx              # Private login and dashboard experience
│   ├── admin.css              # Dark responsive dashboard styling
│   ├── data.js                # Projects, education, roles, archive, social links
│   └── index.css              # Portfolio layout, dark theme, and animations
├── public/                    # Redirect pages and image assets
├── .env.example               # Environment variable names only
├── .gitignore                 # Local secrets and generated files
├── package.json               # Dependencies and commands
├── pnpm-workspace.yaml        # Allows Vite's esbuild installer on pnpm
├── vercel.json                # Same-origin rewrite and security headers
└── vite.config.js             # React/Tailwind and local API adapter
```

## Editing portfolio content

- Update projects, education, archive entries, and social links in `src/data.js`.
- Keep images in the matching `public/assets/images/` category and reference them with a path beginning `/assets/images/`.
- Edit portfolio sections and public form behavior in `src/App.jsx`.
- Edit dashboard interaction and layout in `src/Admin.jsx` and `src/admin.css`.
- Change public-page styles in `src/index.css`.
- Change page metadata and fonts in `index.html`.

## Build

Create the production assets in `dist/`:

```powershell
npm run build
```

Vercel deploys the Vite build and the functions in `api/`. The `vercel.json` rewrite keeps `/login` on the portfolio’s normal domain, while the security headers remove the old FormSubmit policy and prevent search indexing of the login route.
