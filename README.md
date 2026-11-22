# Ankit Verma — Portfolio

A dark, animated, responsive portfolio for presenting Ankit’s work, education, community involvement, learning record, and contact information. The site uses React, Vite, Motion, and Lucide and runs as a public portfolio without a login, backend API, or database.

## Run locally

Requires Node.js 20.19 or newer. Install dependencies once:

    npm install

Start the development site:

    npm run dev

Keep the terminal open while browsing the site; press Ctrl+C to stop it. No Vercel account, environment variables, or database setup is needed for local development.

## How the page works

The portfolio is a single-page site. The fixed navigation scrolls to each section, highlights the section currently in view, and collapses to a menu on smaller screens. A thin progress line tracks scrolling.

- **Home:** introduces Ankit and his interests in AI, machine learning, and systems. The portrait card displays the open-to-work status and leads visitors to contact details.
- **Areas of interest:** a moving strip highlights technical topics.
- **Point of view:** describes Ankit’s approach to computer science and the areas he is exploring.
- **Selected work:** presents projects, descriptions, tags, source links, and live-site links.
- **Education and involvement:** shows education history, open-source work, and community roles.
- **Field notes:** displays certificates, events, and community work. Filters switch between all records, learning, events, and community. Selecting an image opens a larger view; click outside it or press Escape to close it.
- **Contact:** provides a direct email link, social links, location details, and language information. The site does not collect or store visitor messages.

## Motion and accessibility

Motion animates the hero entrance, section reveals, floating details, hover states, scrolling ticker, archive filtering, and image viewer. The pointer glow is enabled only for fine-pointer devices. Motion respects reduced-motion preferences. The page includes a keyboard skip link, visible focus styles, and labelled controls.

## Project structure

    .
    ├── public/                    # Redirect pages and image assets
    ├── src/
    │   ├── main.jsx               # Public portfolio entry point
    │   ├── App.jsx                # Page sections and interactions
    │   ├── data.js                # Projects, education, roles, archive, social links
    │   └── index.css              # Dark theme, layout, and animations
    ├── index.html                 # Page metadata and fonts
    ├── package.json               # Dependencies and commands
    ├── pnpm-workspace.yaml        # Allows Vite’s esbuild installer on pnpm
    ├── vercel.json                # Site security headers
    └── vite.config.js             # React and Tailwind plugins

## Editing portfolio content

- Update projects, education, archive entries, and social links in src/data.js.
- Keep images in the matching public/assets/images/ category and reference them with a path beginning /assets/images/.
- Edit sections and interactions in src/App.jsx.
- Change page styles in src/index.css.
- Change metadata and fonts in index.html.

## Build

Create production assets in dist/:

    npm run build

Vercel can serve the generated static site. No server functions or database are required.
