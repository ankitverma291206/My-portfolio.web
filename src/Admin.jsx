import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  Check,
  Clock3,
  Eye,
  Inbox,
  KeyRound,
  LoaderCircle,
  LogOut,
  Mail,
  MessageSquareText,
  RotateCw,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import './admin.css';

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    cache: 'no-store',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.error || 'The request could not be completed.');
    error.status = response.status;
    throw error;
  }
  return result;
}

export default function AdminPage() {
  const [authState, setAuthState] = useState('checking');
  const [dashboard, setDashboard] = useState(null);
  const [notice, setNotice] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async (quiet = false) => {
    if (!quiet) setRefreshing(true);
    try {
      const data = await requestJson('/api/admin');
      setDashboard(data);
      setAuthState('authenticated');
      setNotice('');
    } catch (error) {
      if (error.status === 401) {
        setAuthState('unauthenticated');
        setDashboard(null);
      } else {
        setNotice(error.message);
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    requestJson('/api/auth').then(({ authenticated }) => {
      if (!alive) return;
      if (authenticated) loadDashboard(true);
      else setAuthState('unauthenticated');
    }).catch(() => {
      if (alive) {
        setAuthState('unauthenticated');
        setNotice('The sign-in service could not be reached. Make sure the server is running.');
      }
    });
    return () => { alive = false; };
  }, [loadDashboard]);

  async function signOut() {
    try {
      await requestJson('/api/auth', { method: 'POST', body: JSON.stringify({ action: 'logout' }) });
    } finally {
      setDashboard(null);
      setAuthState('unauthenticated');
    }
  }

  async function markRead(id) {
    try {
      await requestJson('/api/admin', { method: 'POST', body: JSON.stringify({ action: 'read', id }) });
      setDashboard((current) => {
        if (!current) return current;
        const wasUnread = current.messages.some((message) => message.id === id && message.unread);
        return {
          ...current,
          messageCounts: { ...current.messageCounts, unread: Math.max(0, current.messageCounts.unread - Number(wasUnread)) },
          messages: current.messages.map((message) => message.id === id ? { ...message, unread: false } : message),
        };
      });
    } catch (error) {
      setNotice(error.message);
    }
  }

  if (authState === 'checking') return <FullScreenState label="Checking your session" />;
  if (authState === 'unauthenticated') return <LoginScreen onSuccess={(data) => { setDashboard(data); setAuthState('authenticated'); setNotice(''); }} initialNotice={notice} />;

  return (
    <main className="admin-page">
      <div className="admin-grain" aria-hidden="true" />
      <header className="admin-topbar">
        <a className="admin-brand" href="/" aria-label="Back to portfolio"><span className="admin-brand-mark">AV<span>.</span></span><span>PRIVATE SPACE</span></a>
        <div className="admin-user"><span className="admin-secure-label"><ShieldCheck size={14} /> PRIVATE SESSION</span><span className="admin-user-name"><UserRound size={15} /> {dashboard?.username ?? 'Admin'}</span><button type="button" className="admin-icon-button" onClick={signOut} aria-label="Sign out"><LogOut size={16} /><span>Sign out</span></button></div>
      </header>

      <div className="admin-content">
        <div className="admin-heading-row">
          <div><p className="admin-kicker"><span /> YOUR CONTROL ROOM</p><h1>Good to see you<span>.</span></h1><p className="admin-description">A private view of the portfolio activity and every note people have left.</p></div>
          <button type="button" className="admin-refresh" onClick={() => loadDashboard()} disabled={refreshing}><RotateCw size={15} className={refreshing ? 'is-spinning' : ''} /> Refresh</button>
        </div>

        {notice && <div className="admin-notice" role="alert">{notice}</div>}
        {dashboard ? <>
          <section className="admin-stats" aria-label="Portfolio summary">
            <StatCard icon={<Eye size={18} />} label="Total page views" value={dashboard.pageViews.total.toLocaleString()} detail="Across the tracked portfolio sections" accent="coral" />
            <StatCard icon={<Activity size={18} />} label="Views today" value={dashboard.pageViews.today.toLocaleString()} detail="Since midnight, Bengaluru time" accent="violet" />
            <StatCard icon={<Inbox size={18} />} label="Notes received" value={dashboard.messageCounts.total.toLocaleString()} detail={`${dashboard.messageCounts.unread} unread · latest 100 shown`} accent="mint" />
          </section>

          <section className="admin-grid">
            <div className="admin-panel admin-pages-panel">
              <PanelHeading icon={<Activity size={17} />} title="Where people look" label="PAGE VIEWS" />
              {dashboard.pages.length ? <div className="page-view-list">{dashboard.pages.map((page, index) => {
                const max = Math.max(...dashboard.pages.map((item) => item.views), 1);
                return <div className="page-view-row" key={page.path}><div className="page-view-copy"><span>{page.path === '/' || page.path === '/#home' ? 'Home' : page.path.replace('/#', '').replace(/^./, (character) => character.toUpperCase())}</span><strong>{page.views.toLocaleString()}</strong></div><div className="page-view-track"><i style={{ width: `${Math.max(7, (page.views / max) * 100)}%` }} /></div></div>;
              })}</div> : <EmptyState icon={<Eye size={19} />} title="No views recorded yet" detail="Portfolio views will appear here as people visit." />}
              <p className="admin-privacy-note"><ShieldCheck size={14} /> Only section counts and times appear here. Raw IP addresses and visitor identities are not stored.</p>
            </div>

            <div className="admin-panel admin-activity-panel">
              <PanelHeading icon={<Clock3 size={17} />} title="Recent activity" label="LATEST VIEWS" />
              {dashboard.recentViews.length ? <ol className="recent-view-list">{dashboard.recentViews.slice(0, 9).map((view, index) => <li key={`${view.path}-${view.viewed_at}-${index}`}><span className="recent-view-dot" /><span className="recent-view-path">{view.path === '/' || view.path === '/#home' ? 'Home' : view.path.replace('/#', '').replace(/^./, (character) => character.toUpperCase())}</span><time dateTime={view.viewed_at}>{formatTime(view.viewed_at)}</time></li>)}</ol> : <EmptyState icon={<Clock3 size={19} />} title="No recent activity" detail="New views will show up here." />}
              <p className="admin-activity-footnote">This counts section views, not unique people. Short-lived keyed anti-spam tokens are cleaned up after 24 hours.</p>
            </div>
          </section>

          <section className="admin-panel admin-inbox-panel">
            <div className="admin-inbox-head"><PanelHeading icon={<MessageSquareText size={17} />} title="Leave a note inbox" label="PRIVATE MESSAGES" /><span className="inbox-total">{dashboard.messageCounts.total} {dashboard.messageCounts.total === 1 ? 'note' : 'notes'}</span></div>
            {dashboard.messages.length ? <div className="admin-message-list">{dashboard.messages.map((message) => <article className={`admin-message${message.unread ? ' admin-message--unread' : ''}`} key={message.id}>
              <div className="admin-message-avatar" aria-hidden="true">{message.name.slice(0, 1).toUpperCase()}</div>
              <div className="admin-message-copy"><div className="admin-message-byline"><div><h3>{message.name}</h3><a href={`mailto:${encodeURIComponent(message.email)}`}>{message.email} <Mail size={13} /></a></div><time dateTime={message.received_at}>{formatDate(message.received_at)}</time></div><p>{message.message}</p>{message.unread && <span className="admin-unread-pill">NEW</span>}</div>
              <div className="admin-message-actions"><a href={`mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent(`Re: note from ${message.name}`)}`} className="admin-reply-button">Reply <Mail size={14} /></a>{message.unread && <button type="button" className="admin-read-button" onClick={() => markRead(message.id)} aria-label={`Mark message from ${message.name} as read`}><Check size={15} /></button>}</div>
            </article>)}</div> : <EmptyState icon={<Inbox size={20} />} title="Your inbox is clear" detail="New messages sent through the portfolio will appear here." />}
            {dashboard.messages.length === 100 && <p className="admin-inbox-limit">Showing the latest 100 notes.</p>}
          </section>
        </> : <div className="admin-loading-panel"><LoaderCircle className="is-spinning" size={22} /> Loading your dashboard…</div>}

        <footer className="admin-footer"><span>PRIVATE SPACE · ANKIT VERMA</span><a href="/"><ArrowLeft size={13} /> Back to portfolio</a></footer>
      </div>
    </main>
  );
}

function LoginScreen({ onSuccess, initialNotice }) {
  const [values, setValues] = useState({ username: '', password: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(initialNotice || '');

  async function submit(event) {
    event.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setError('');
    try {
      await requestJson('/api/auth', { method: 'POST', body: JSON.stringify({ action: 'login', ...values }) });
      const dashboard = await requestJson('/api/admin');
      onSuccess(dashboard);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setStatus('idle');
    }
  }

  return (
    <main className="admin-login-page">
      <div className="admin-grain" aria-hidden="true" />
      <a className="login-back-link" href="/"><ArrowLeft size={15} /> Portfolio</a>
      <section className="login-card">
        <div className="login-emblem"><KeyRound size={22} /></div>
        <p className="admin-kicker"><span /> PRIVATE ACCESS</p>
        <h1>Your space<span>.</span></h1>
        <p className="login-description">Sign in to see portfolio activity and read the notes people have sent.</p>
        <form className="admin-login-form" onSubmit={submit} aria-busy={status === 'sending'}>
          <label htmlFor="admin-username">Username</label>
          <input id="admin-username" name="username" autoComplete="username" maxLength={120} required value={values.username} onChange={(event) => setValues((current) => ({ ...current, username: event.target.value }))} />
          <label htmlFor="admin-password">Password</label>
          <input id="admin-password" name="password" type="password" autoComplete="current-password" maxLength={256} required value={values.password} onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))} />
          {error && <p className="admin-login-error" role="alert">{error}</p>}
          <button type="submit" disabled={status === 'sending'}>{status === 'sending' ? <><LoaderCircle size={17} className="is-spinning" /> Checking…</> : <>Open private dashboard <ArrowLeft size={16} /></>}</button>
        </form>
        <p className="login-security"><ShieldCheck size={14} /> Your session is encrypted and private.</p>
      </section>
      <span className="login-copyright">ANKIT VERMA · PRIVATE DASHBOARD</span>
    </main>
  );
}

function StatCard({ icon, label, value, detail, accent }) {
  return <article className={`admin-stat admin-stat--${accent}`}><span className="admin-stat-icon">{icon}</span><span className="admin-stat-label">{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}

function PanelHeading({ icon, title, label }) {
  return <div className="admin-panel-heading"><span className="admin-panel-icon">{icon}</span><div><span>{label}</span><h2>{title}</h2></div></div>;
}

function EmptyState({ icon, title, detail }) {
  return <div className="admin-empty">{icon}<strong>{title}</strong><span>{detail}</span></div>;
}

function FullScreenState({ label }) {
  return <main className="admin-login-page"><div className="admin-grain" aria-hidden="true" /><div className="admin-loading-panel"><LoaderCircle className="is-spinning" size={22} /> {label}…</div></main>;
}

function formatTime(value) {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'short' }).format(new Date(value));
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
