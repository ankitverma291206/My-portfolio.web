# Ankit Verma — Portfolio

A dark, animated, responsive portfolio for presenting Ankit’s work, education, community involvement, learning record, and contact information. It is a client-rendered React application served and built with Vite.

## Run the site

Requires Node.js 20.19 or newer. Install the project packages once, then start the development server:

```powershell
pnpm install
pnpm dev
```

The `dev` script starts Vite and opens the site in a browser. Keep the terminal open while using the site; press `Ctrl+C` there to stop the server.

If you use npm instead of pnpm:

```powershell
npm install
npm run dev
```

## How the page works

The site is a single-page application. The navigation links move between sections on the same page, and the active navigation item follows the section currently in view. On small screens, the navigation collapses into a menu button. A thin progress line at the top tracks how far the visitor has scrolled.

### Page sections

- **Home:** introduces Ankit and his interests in AI, machine learning, and systems. The portrait card includes the open-to-work status and a link to the contact section.
- **Areas of interest:** a continuously moving strip highlights the site’s main technical topics.
- **Point of view:** summarizes Ankit’s approach to computer science and the areas he is exploring.
- **Selected work:** presents project cards. Project names, descriptions, tags, and repository or live-site links come from the project data.
- **Education and involvement:** shows education history alongside open-source and community roles.
- **Field notes:** displays certificates, events, and community work. The filter buttons switch between all records, learning, events, and community. Selecting an image opens a larger view; click the backdrop or press `Escape` to close it.
- **Contact:** provides a direct email link, social links, location details, and a message form.

### Motion and accessibility

Motion animates the hero entrance, section reveals, floating details, hover states, scrolling ticker, archive filtering, and image viewer. The pointer glow is only enabled for fine-pointer devices. The stylesheet and motion components respect reduced-motion preferences. The page also includes a keyboard skip link, visible focus styles, labels for form inputs, and live announcements for message status.

### Sending a message

The contact form collects a name, reply email, and message. It sends the submission as JSON to FormSubmit’s hosted AJAX endpoint, so the visitor remains on the page. The sender’s email is included as the reply-to address, and the email subject identifies the sender. Success and failure are shown beside the form; if sending fails, the visitor can use the direct email link instead.

The contact address is defined once as `contactEmail` near the top of `src/App.jsx` and is used by both the mail link and form endpoint. On the first form submission, FormSubmit sends an activation email to that address. Confirm that email to activate delivery. FormSubmit handles the submission before forwarding it to the mailbox; see its [AJAX documentation](https://formsubmit.co/ajax-documentation) and [setup instructions](https://formsubmit.co/).

## Project structure

```text
.
├── index.html                 # Document metadata, fonts, and React mount point
├── package.json               # Dependencies and development/build commands
├── pnpm-lock.yaml             # Locked package versions for pnpm installs
├── vite.config.js             # Vite, React, and Tailwind plugins
├── src/
│   ├── main.jsx               # React application entry point
│   ├── App.jsx                # Page sections, interactions, and form behavior
│   ├── data.js                # Projects, education, roles, archive, and social links
│   └── index.css              # Dark theme, layout, responsive styles, and animations
└── public/
    ├── *.html                 # Redirects for the former page URLs
    └── assets/images/
        ├── profile/
        ├── credentials/
        ├── events/
        └── community/
```

## Editing portfolio content

- Update project cards, education, experience, archive entries, and social links in `src/data.js`.
- Keep images in the matching `public/assets/images/` category and reference them from the data using a path beginning with `/assets/images/`.
- Edit sections, navigation, archive behavior, contact behavior, and form states in `src/App.jsx`.
- Adjust colors, typography, spacing, responsive breakpoints, and motion styling in `src/index.css`.
- Change the browser title, description, Open Graph metadata, and font imports in `index.html`.

## Build and preview

Create the production build in `dist/`:

```powershell
pnpm build
```

Preview that build locally:

```powershell
pnpm preview
```

The same commands can be run with npm as `npm run build` and `npm run preview`.

## Security and deployment

This is a static, client-side portfolio; it has no application server, login, session, or private API keys. The contact email is public by design, and the form sends visitor-provided name, email, and message content through FormSubmit before delivery to the inbox.

`vercel.json` adds a Content Security Policy and browser security headers for Vercel deployments. The policy only permits site scripts, the Google Fonts stylesheet/font hosts, and the FormSubmit endpoint. Inline styles remain allowed because Motion applies animation styles at runtime; inline scripts and `eval` are not allowed. If you deploy somewhere other than Vercel, configure equivalent response headers in that host’s settings. The form also includes a honeypot field; the email provider remains responsible for final spam filtering and delivery.
