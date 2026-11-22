import { useEffect, useMemo, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'motion/react';
import {
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  BriefcaseBusiness,
  Code2,
  ExternalLink,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  Menu,
  Orbit,
  Sparkles,
  Terminal,
  Workflow,
  X,
} from 'lucide-react';
import { education, experience, learning, projects, socials } from './data.js';

const contactEmail = 'ankitverma291206@gmail.com';

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'work', label: 'Work' },
  { id: 'path', label: 'Path' },
  { id: 'notes', label: 'Archive' },
  { id: 'contact', label: 'Contact' },
];

const filters = [
  { id: 'all', label: 'Everything' },
  { id: 'learning', label: 'Learning' },
  { id: 'events', label: 'Events' },
  { id: 'community', label: 'Community' },
];

function Reveal({ children, className = '', delay = 0, amount = 0.18 }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: reduceMotion ? 0 : 0.72, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function PointerAura() {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const smoothX = useSpring(x, { stiffness: 90, damping: 24, mass: 0.55 });
  const smoothY = useSpring(y, { stiffness: 90, damping: 24, mass: 0.55 });

  useEffect(() => {
    if (reduceMotion || !window.matchMedia('(pointer: fine)').matches) return undefined;
    const move = (event) => {
      x.set(event.clientX);
      y.set(event.clientY);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [reduceMotion, x, y]);

  return <motion.div className="pointer-aura" style={{ x: smoothX, y: smoothY }} aria-hidden="true" />;
}

function SiteHeader({ active, onNavigate }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.header className="site-header" initial={{ y: -90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
      <a className="brand" href="#home" onClick={() => onNavigate('home')} aria-label="Ankit Verma, home">
        <span className="brand-mark">AV<span>.</span></span>
        <span className="brand-name">ANKIT VERMA<small>COMPUTER SCIENCE · BENGALURU</small></span>
      </a>
      <button className="nav-toggle" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      <nav className={`nav-links${open ? ' nav-links--open' : ''}`} aria-label="Main navigation">
        {navItems.map((item) => (
          <a key={item.id} className={active === item.id ? 'is-active' : ''} href={`#${item.id}`} aria-current={active === item.id ? 'location' : undefined} onClick={() => { setOpen(false); onNavigate(item.id); }}>
            {item.label}
          </a>
        ))}
        <a className="nav-cta" href="#contact" onClick={() => { setOpen(false); onNavigate('contact'); }}>Let’s talk <ArrowUpRight size={14} /></a>
      </nav>
    </motion.header>
  );
}

function Eyebrow({ children, light = false }) {
  return <p className={`eyebrow${light ? ' eyebrow--light' : ''}`}><span className="eyebrow-mark" />{children}</p>;
}

function SectionTitle({ index, label, title, sub }) {
  return (
    <Reveal className="section-title-row">
      <div>
        <Eyebrow>{label}</Eyebrow>
        <h2>{title}</h2>
      </div>
      {sub && <p className="section-subtitle">{sub}</p>}
    </Reveal>
  );
}

function ProjectArtwork({ kind }) {
  if (kind === 'web') {
    return (
      <div className="project-art project-art--web" aria-hidden="true">
        <div className="browser-bar"><span /><span /><span /><i>ankitverma.dev</i><b>↗</b></div>
        <div className="browser-content"><span className="browser-mini">PERSONAL PORTFOLIO / 2026</span><strong>Curious by nature.<br /><em>Built with intent.</em></strong><div className="browser-lines"><i /><i /><i /></div><span className="browser-chip">HTML&nbsp; / &nbsp;CSS&nbsp; / &nbsp;JS</span></div>
        <span className="art-index">DESIGN / CODE</span>
      </div>
    );
  }
  return (
    <div className="project-art project-art--signal" aria-hidden="true">
      <div className="signal-orbit signal-orbit--one" /><div className="signal-orbit signal-orbit--two" />
      <div className="signal-connector signal-connector--a" /><div className="signal-connector signal-connector--b" /><div className="signal-connector signal-connector--c" />
      <span className="signal-node signal-node--a" /><span className="signal-node signal-node--b" /><span className="signal-node signal-node--c" />
      <div className="signal-core"><BrainCircuit size={36} strokeWidth={1.25} /><span>BIAS<br />SHIELD</span></div>
      <span className="art-index">FAIRNESS / MODEL</span>
    </div>
  );
}

function ProjectCard({ project, index, onOpen }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.article className={`project-card project-card--${project.kind}`} layout whileHover={reduceMotion ? undefined : { y: -8 }} transition={{ type: 'spring', stiffness: 280, damping: 22 }}>
      <div className="project-card-art"><ProjectArtwork kind={project.kind} /><span className="project-card-number">{project.number}</span></div>
      <div className="project-card-content">
        <div className="project-kicker"><span>{project.type}</span><span className="project-live"><i /> FEATURED WORK</span></div>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
        <div className="tag-list">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <div className="project-links">
          <a href={project.github} target="_blank" rel="noreferrer"><Code2 size={16} /> Source code <ArrowUpRight size={14} /></a>
          {project.live && <a href={project.live} target="_blank" rel="noreferrer"><Globe size={16} /> Live site <ArrowUpRight size={14} /></a>}
        </div>
      </div>
    </motion.article>
  );
}

function ArchiveCard({ item, index, onImage }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.article className="archive-card" layout initial={reduceMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.35, delay: Math.min(index * 0.025, 0.22) }} whileHover={reduceMotion ? undefined : { y: -5 }}>
      <button className="archive-image" onClick={() => onImage(item)} aria-label={`View image for ${item.title}`}>
        <img src={item.image} alt="" loading="lazy" />
        <span className="archive-image-shade" />
        <span className="archive-image-action"><ExternalLink size={15} /></span>
        <span className="archive-category">{item.category}</span>
      </button>
      <div className="archive-copy">
        <span className="archive-issuer">{item.issuer}</span>
        <h3>{item.title}</h3>
        {item.description && <p>{item.description}</p>}
        <a className="archive-link" href={item.href} target="_blank" rel="noreferrer">View record <ArrowUpRight size={14} /></a>
      </div>
    </motion.article>
  );
}

function Lightbox({ item, onClose }) {
  useEffect(() => {
    const closeOnEscape = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <motion.div className="lightbox" role="dialog" aria-modal="true" aria-label={item.title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <motion.div className="lightbox-panel" initial={{ y: 22, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 18, scale: 0.98 }} transition={{ type: 'spring', damping: 24, stiffness: 220 }}>
        <button className="lightbox-close" onClick={onClose} aria-label="Close image"><X size={18} /></button>
        <img src={item.image} alt={`${item.title} — ${item.issuer}`} />
        <div className="lightbox-caption"><span>{item.category}</span><strong>{item.title}</strong><small>{item.issuer}</small></div>
      </motion.div>
    </motion.div>
  );
}

function MessageForm() {
  const [values, setValues] = useState({ name: '', email: '', message: '' });
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const updateValue = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    if (status === 'success' || status === 'error') {
      setStatus('idle');
      setErrorMessage('');
    }
  };

  async function handleSubmit(event) {
    event.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setErrorMessage('');

    const sender = {
      name: values.name.trim(),
      email: values.email.trim(),
      message: values.message.trim(),
    };

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ ...sender, website: honeypot.trim() }),
      });
      const result = await response.json().catch(() => null);
      if (!result) {
        throw new Error('The message service returned an unreadable response. Please try again.');
      }
      if (!response.ok || result.ok !== true) {
        throw new Error(typeof result.error === 'string' ? result.error : `The message could not be saved (HTTP ${response.status}).`);
      }
      setValues({ name: '', email: '', message: '' });
      setStatus('success');
    } catch (error) {
      setErrorMessage(error instanceof TypeError
        ? 'Could not reach the message service. Check your connection and make sure the full server is running.'
        : error.message || 'The message service could not complete the request.');
      setStatus('error');
    }
  }

  return (
    <form className="message-form" onSubmit={handleSubmit} aria-busy={status === 'sending'}>
      <label className="message-honeypot" aria-hidden="true">Leave this field empty
        <input name="website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} />
      </label>
      <div className="message-field">
        <label htmlFor="message-name">Your name</label>
        <input id="message-name" name="name" type="text" autoComplete="name" maxLength={80} placeholder="Ankit Sharma" required value={values.name} onChange={updateValue('name')} />
      </div>
      <div className="message-field">
        <label htmlFor="message-email">Your email</label>
        <input id="message-email" name="email" type="email" autoComplete="email" maxLength={254} placeholder="you@example.com" required value={values.email} onChange={updateValue('email')} />
      </div>
      <div className="message-field message-field--wide">
        <label htmlFor="message-body">Message</label>
        <textarea id="message-body" name="message" rows={5} minLength={8} maxLength={3000} placeholder="What would you like to talk about?" required value={values.message} onChange={updateValue('message')} />
      </div>
      <div className="message-form-footer">
        <button className="button button--solid message-submit" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send message'} <ArrowUpRight size={16} />
        </button>
        <p className="message-privacy">Saved to a private inbox. Your email is used only if I reply.</p>
      </div>
      {status === 'success' && <div className="message-feedback message-feedback--success" role="status" aria-live="polite"><strong>Message sent</strong><span>Thanks for reaching out. I’ll get back to you soon.</span></div>}
      {status === 'error' && (
        <div className="message-feedback message-feedback--error" role="alert" aria-live="assertive">
          <strong>Message couldn’t be sent</strong>
          <span>{errorMessage}</span>
          <p>You can also reach me directly by email.</p>
          <a href={`mailto:${contactEmail}`}>Email me directly <ArrowUpRight size={13} /></a>
        </div>
      )}
    </form>
  );
}

function App() {
  const [active, setActive] = useState('home');
  const [filter, setFilter] = useState('all');
  const [lightbox, setLightbox] = useState(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 30, restDelta: 0.001 });
  const visibleLearning = useMemo(() => filter === 'all' ? learning : learning.filter((item) => item.group === filter), [filter]);

  useEffect(() => {
    const sections = navItems.map(({ id }) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver((entries) => {
      const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (current) setActive(current.target.id);
    }, { rootMargin: '-22% 0px -58% 0px', threshold: [0, 0.12, 0.25, 0.5] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="app-shell">
      <motion.div className="scroll-progress" style={{ scaleX: progress }} aria-hidden="true" />
      <PointerAura />
      <div className="ambient ambient--violet" aria-hidden="true" /><div className="ambient ambient--coral" aria-hidden="true" />
      <a className="skip-link sr-only focus:not-sr-only" href="#main">Skip to content</a>
      <SiteHeader active={active} onNavigate={setActive} />

      <main id="main">
        <section className="hero section-wrap" id="home">
          <div className="hero-copy">
            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.38 } } }}>
              <motion.p className="hero-label" variants={riseVariants}><span className="hero-label-dot" /> COMPUTER SCIENCE · PES UNIVERSITY</motion.p>
              <motion.h1 variants={riseVariants}><span>ANKIT</span><span className="hero-surname">VERMA<span className="hero-period">.</span></span></motion.h1>
              <motion.div className="hero-role" variants={riseVariants}><span>AI</span><i>×</i><span>MACHINE LEARNING</span><i>×</i><span>SYSTEMS</span></motion.div>
              <motion.p className="hero-lede" variants={riseVariants}>I build at the edge of intelligence and infrastructure—exploring how AI, machine learning, and thoughtful systems can make technology more useful.</motion.p>
              <motion.div className="hero-actions" variants={riseVariants}>
                <a className="button button--solid" href="#work">Explore selected work <ArrowDownRight size={17} /></a>
                <a className="button button--outline" href="#contact">Let’s build something <ArrowUpRight size={16} /></a>
              </motion.div>
              <motion.div className="hero-footline" variants={riseVariants}><span>ANKITO / PRALAY</span><span className="footline-rule" /><span><MapPin size={13} /> BENGALURU, INDIA</span></motion.div>
            </motion.div>
          </div>

          <motion.div className="hero-visual" initial={reduceMotion ? false : { opacity: 0, scale: 0.88, rotate: 4 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}>
            <div className="hero-geometry" aria-hidden="true"><div className="geometry-ring geometry-ring--outer" /><div className="geometry-ring geometry-ring--inner" /><span className="geometry-cross geometry-cross--a" /><span className="geometry-cross geometry-cross--b" /><span className="geometry-point" /></div>
            <a className="availability-badge" href="#contact" aria-label="Open to work — contact Ankit">
              <span className="availability-lamp" aria-hidden="true" />
              <span className="availability-copy"><strong>OPEN TO WORK</strong><small>Available for opportunities</small></span>
              <span className="availability-arrow"><ArrowUpRight size={15} aria-hidden="true" /></span>
            </a>
            <motion.div className="portrait-card" whileHover={reduceMotion ? undefined : { rotate: -1, scale: 1.015 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
              <img src="/assets/images/profile/port4.jpeg" alt="Ankit Verma in Bengaluru" fetchPriority="high" />
              <div className="portrait-bottomline"><span>ANKIT VERMA</span><span>PESU / CSE</span></div>
            </motion.div>
            <motion.div className="hero-float hero-float--one" animate={reduceMotion ? undefined : { y: [0, -9, 0], rotate: [0, 2, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}><BrainCircuit size={17} /><span>INTELLIGENCE</span></motion.div>
            <motion.div className="hero-float hero-float--two" animate={reduceMotion ? undefined : { y: [0, 8, 0], rotate: [0, -2, 0] }} transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut' }}><Workflow size={17} /><span>SYSTEMS</span></motion.div>
            <div className="hero-coord">12°58′ N<br />77°35′ E</div>
          </motion.div>
          <a className="hero-scroll" href="#about"><span>SCROLL TO EXPLORE</span><ArrowDown size={15} /></a>
          <div className="hero-side-label">MACHINE INTELLIGENCE / HUMAN IMPACT</div>
        </section>

        <div className="ticker" aria-label="Areas of interest">
          <div className="ticker-track">{Array.from({ length: 2 }, (_, index) => <span className="ticker-set" key={index}><b>ARTIFICIAL INTELLIGENCE</b><i>✳</i><b>MACHINE LEARNING</b><i>✳</i><b>COMPUTER SYSTEMS</b><i>✳</i><b>OPEN SOURCE</b><i>✳</i></span>)}</div>
        </div>

        <section className="about-section section-wrap" id="about">
          <SectionTitle label="The point of view" title={<>Questions first.<br /><em>Then, the code.</em></>} sub="I study Computer Science Engineering at PES University. I’m drawn to the difficult questions behind intelligent systems—and to the work of turning ideas into something people can use." />
          <div className="about-grid">
            <Reveal className="manifesto-card">
              <span className="manifesto-mark">“</span>
              <p>If you don’t talk about it,<br /><em>the problem isn’t solved.</em></p>
              <span className="manifesto-credit">A PRINCIPLE I BUILD BY</span>
            </Reveal>
            <Reveal className="focus-card" delay={0.1}>
              <div className="focus-card-top"><span>INTEREST MAP</span><Orbit size={17} /></div>
              <div className="focus-stack"><div><BrainCircuit /><span>Machine learning</span><b>01</b></div><div><Workflow /><span>Systems &amp; architecture</span><b>02</b></div><div><Sparkles /><span>AI with human impact</span><b>03</b></div></div>
              <div className="focus-card-foot"><span>ALWAYS LEARNING</span><span className="focus-pulse" /></div>
            </Reveal>
          </div>
        </section>

        <section className="work-section section-wrap" id="work">
          <SectionTitle label="Selected work" title={<>Ideas made<br /><em>concrete.</em></>} sub="A small set of projects exploring the way I think: make a question tangible, build a system around it, keep learning from the result." />
          <div className="projects-grid">{projects.map((project, index) => <Reveal key={project.id} delay={index * 0.12}><ProjectCard project={project} index={index} /></Reveal>)}</div>
          <Reveal className="work-note"><span className="work-note-mark"><Terminal size={19} /></span><p>Built with curiosity.<br /><strong>Improved with every iteration.</strong></p><a href="https://github.com/ankitverma291206" target="_blank" rel="noreferrer" aria-label="Browse Ankit Verma's GitHub"><Code2 size={19} /><ArrowUpRight size={13} /></a></Reveal>
        </section>

        <section className="path-section section-wrap" id="path">
          <SectionTitle label="Education &amp; involvement" title={<>Built through<br /><em>participation.</em></>} sub="Learning in lectures, in open-source projects, and alongside the people building community around technology." />
          <div className="path-grid">
            <Reveal className="path-column">
              <div className="column-heading"><span className="column-icon"><GraduationCap size={17} /></span><span>EDUCATION</span></div>
              <div className="education-list">{education.map((item) => <article className="education-item" key={item.school}><span className="timeline-dot" /><div><small>{item.period}</small><h3>{item.school}</h3><p>{item.degree}</p><span className="item-place"><MapPin size={12} /> {item.place}</span></div></article>)}</div>
            </Reveal>
            <Reveal className="path-column path-column--experience" delay={0.12}>
              <div className="column-heading"><span className="column-icon column-icon--violet"><BriefcaseBusiness size={16} /></span><span>CONTRIBUTION &amp; LEADERSHIP</span></div>
              <div className="experience-list">{experience.map((item) => <article className="experience-item" key={item.role}><div className="experience-meta"><span>{item.eyebrow}</span><small>{item.period}</small></div><h3>{item.role}</h3><p>{item.details}</p><div className="tag-list">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></article>)}</div>
            </Reveal>
          </div>
        </section>

        <section className="archive-section section-wrap" id="notes">
          <SectionTitle label="Field notes" title={<>Proof of the<br /><em>practice.</em></>} sub="Certificates, hackathons, events, and community roles. A growing record of showing up and doing the work." />
          <div className="archive-controls">
            <div className="filter-tabs" role="group" aria-label="Filter archive">
              {filters.map((item) => <button key={item.id} className={filter === item.id ? 'filter-tab is-active' : 'filter-tab'} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}<span>{item.id === 'all' ? learning.length : learning.filter((entry) => entry.group === item.id).length}</span></button>)}
            </div>
            <span className="archive-count">{visibleLearning.length} RECORDS</span>
          </div>
          <motion.div className="archive-grid" layout>
            <AnimatePresence mode="popLayout">{visibleLearning.map((item, index) => <ArchiveCard item={item} index={index} onImage={setLightbox} key={item.title + item.image} />)}</AnimatePresence>
          </motion.div>
        </section>

        <section className="contact-section section-wrap" id="contact">
          <Reveal className="contact-panel">
            <div className="contact-panel-orbit" aria-hidden="true"><span /><span /><span /></div>
            <div className="contact-main-copy"><Eyebrow light>Open channel · Bengaluru, India</Eyebrow><h2>Let’s make<br /><em>something matter.</em></h2><p>Have an interesting problem, a research idea, or an opportunity at the intersection of AI and systems? I’m all ears.</p><a className="button button--paper" href={`mailto:${contactEmail}`}>{contactEmail} <ArrowUpRight size={17} /></a></div>
            <div className="contact-side"><span className="contact-side-label">ELSEWHERE</span>{socials.map((item) => <a key={item.label} href={item.href} target="_blank" rel="noreferrer"><span>{item.label}<small>{item.detail}</small></span><ArrowUpRight size={16} /></a>)}<div className="contact-clock"><span><MapPin size={14} /> Bengaluru · IST</span><span>English / Hindi</span></div></div>
          </Reveal>
          <Reveal className="message-card" delay={0.12}>
            <div className="message-intro">
              <Eyebrow>Leave a note</Eyebrow>
              <h3>Have something<br /><em>on your mind?</em></h3>
              <p>Leave a note in my private inbox. Include your email if you’d like me to get back to you.</p>
            </div>
            <MessageForm />
          </Reveal>
        </section>
      </main>

      <footer className="site-footer section-wrap"><a className="footer-signature" href="#home">ANKIT VERMA<span>.</span></a><span>DESIGNED WITH CURIOSITY · BUILT IN BENGALURU</span><a className="back-top" href="#home">BACK TO TOP <ArrowUpRight size={13} /></a></footer>

      <AnimatePresence>{lightbox && <Lightbox item={lightbox} onClose={() => setLightbox(null)} />}</AnimatePresence>
    </div>
  );
}

const riseVariants = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] } },
};

export default App;
