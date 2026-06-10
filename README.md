# My-portfolio.web

# My-Portfolio.web
### Ankit Verma — Ankito — Pralay

Personal portfolio website. Five separate pages, each with a unique color theme and animated wave.

---

## File Structure

```
portfolio/
├── index.html          # Home — silver wave, pure black
├── projects.html       # Projects — blue wave, navy bg
├── experience.html     # Experience — amber wave, dark umber bg
├── prodev.html         # Professional Development — green wave, forest bg
├── contact.html        # Contact — pink wave, plum bg
├── styles.css          # Shared styles used by all pages
├── wave.js             # Animated wave (reads color from data-color attr)
├── nav.js              # Scroll reveal animation
├── portfolio-photo.png # Profile photo
└── README.md           # This file
```

---

## Getting Started

Just open `index.html` in a browser — no build step, no dependencies, no server needed.

All files must stay in the **same folder** for links, styles, and the photo to work correctly.

---

## How to Customize

### Update your personal details
Search for placeholder text across the HTML files and replace:
- `yourhandle` / `yourusername` / `yourspotifyid` → your real handles
- `your@email.com` → your real email
- `Company Name` → your actual employer
- `Project Alpha / Beta / Gamma` → your real projects

---

### Add a skill (Home page — `index.html`)
Inside `.hero-skills`, copy and paste:
```html
<span class="skill-chip">Your Skill</span>
```

---

### Add a project (`projects.html`)
Copy this block and paste inside `.projects-grid`:
```html
<article class="pcard reveal">
  <div class="pcard__header">
    <span class="pcard__tag hi">ML / AI</span>
    <span class="pcard__tag">Python</span>
    <a href="LIVE_URL" class="pcard__ext" target="_blank">
      <i class="ti ti-arrow-up-right"></i>
    </a>
  </div>
  <h3 class="pcard__title">Project Name</h3>
  <p class="pcard__desc">One-liner description of the project.</p>
  <div class="pcard__footer">
    <span class="pcard__date">Month Year</span>
    <a href="GITHUB_URL" class="pcard__gh" target="_blank">
      <i class="ti ti-brand-github"></i> GitHub
    </a>
  </div>
</article>
```

---

### Add an experience entry (`experience.html`)
Copy this block and paste inside `.timeline`:
```html
<div class="exp-entry reveal">
  <div class="exp-entry__left">
    <span class="exp-entry__date">Mon Year – Mon Year</span>
    <span class="exp-entry__type">Internship</span>
  </div>
  <div class="exp-entry__right">
    <h3 class="exp-entry__role">Your Role Title</h3>
    <p class="exp-entry__company">Company · Location</p>
    <ul class="exp-entry__bullets">
      <li>What you did and the impact it had.</li>
      <li>Second bullet point.</li>
    </ul>
    <div class="exp-entry__tags">
      <span class="exp-entry__tag">Python</span>
    </div>
  </div>
</div>
```

---

### Add a Pro Dev card (`prodev.html`)

**With a photo** — put your image file in the same folder, then:
```html
<div class="pdcard reveal">
  <div class="pdcard__photo">
    <img src="YOUR_PHOTO.jpg" alt="Description"/>
  </div>
  <div class="pdcard__body">
    <div class="pdcard__top">
      <span class="pdcard__cat">Certification</span>
      <span class="pdcard__date">Mon Year</span>
    </div>
    <h3 class="pdcard__title">Course or Cert Name</h3>
    <p class="pdcard__issuer">Platform · Provider</p>
    <p class="pdcard__desc">One line on what you learned.</p>
    <a href="CREDENTIAL_URL" class="pdcard__cta" target="_blank">
      View credential <i class="ti ti-arrow-up-right"></i>
    </a>
  </div>
</div>
```

**Without a photo** — replace the photo div with an icon placeholder:
```html
<div class="pdcard__photo pdcard__photo--icon">
  <i class="ti ti-certificate"></i>
</div>
```
Other icon options: `ti-book`, `ti-presentation`, `ti-trophy`, `ti-code`

---

### Add a contact / social link (`contact.html`)
Copy this block and paste inside `.contact-links`:
```html
<a href="URL" target="_blank" class="slink">
  <span class="slink__icon"><i class="ti ti-brand-ICON"></i></span>
  <span class="slink__info">
    <span class="slink__platform">Platform Name</span>
    <span class="slink__handle">your handle or URL</span>
  </span>
  <i class="ti ti-arrow-up-right slink__arr"></i>
</a>
```
Find icon names at [tabler.io/icons](https://tabler.io/icons) — search and use the class e.g. `ti-brand-twitter`.

---

### Change the wave color on any page
In each HTML file, find the canvas tag near the top:
```html
<canvas id="c" data-color="#60c8ff"></canvas>
```
Change the hex value to any color you want.

---

## Page Themes

| Page | Wave | Background | Accent |
|------|------|-----------|--------|
| Home | `#b0b0b0` silver | `#030303` | white + red |
| Projects | `#60c8ff` blue | `#02060f` | electric blue |
| Experience | `#ffc152` amber | `#080501` | warm amber |
| Pro Dev | `#5dffb0` green | `#010a04` | mint green |
| Contact | `#ff7eb3` pink | `#070104` | rose pink |

---

## Built With

- Vanilla HTML / CSS / JS — no frameworks, no build tools
- [Tabler Icons](https://tabler.io/icons) — icon set
- [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) — display font
- [Inter](https://fonts.google.com/specimen/Inter) — body font

---

*Ankit Verma · PES University · Bengaluru*