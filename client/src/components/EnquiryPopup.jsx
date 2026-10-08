import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Phone, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { api } from '../lib/api.js';
import { siteImages } from '../data/images.js';

const SEEN_KEY = 'ci_enquiry_prompt_seen_v2';

export default function EnquiryPopup() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const nameRef = useRef(null);
  const promptTimer = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const openManually = () => {
      window.clearTimeout(promptTimer.current);
      sessionStorage.setItem(SEEN_KEY, '1');
      setOpen(true);
    };
    window.addEventListener('crome:open-enquiry', openManually);
    if (sessionStorage.getItem(SEEN_KEY)) return () => window.removeEventListener('crome:open-enquiry', openManually);
    const schedule = () => {
      if (promptTimer.current || sessionStorage.getItem(SEEN_KEY)) return;
      promptTimer.current = window.setTimeout(() => {
        promptTimer.current = null;
        sessionStorage.setItem(SEEN_KEY, '1');
        setOpen(true);
      }, 10000);
    };
    schedule();
    return () => {
      window.removeEventListener('crome:open-enquiry', openManually);
      window.clearTimeout(promptTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    nameRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) setOpen(false);
      if (event.key === 'Tab') {
        const controls = [...document.querySelectorAll('.enquiry-popup button:not(:disabled), .enquiry-popup input:not(:disabled), .enquiry-popup select:not(:disabled), .enquiry-popup textarea:not(:disabled)')];
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, busy]);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await api.post('/leads', {
        name: values.name,
        phone: values.phone,
        email: values.email,
        company: values.company,
        sport: values.sport,
        city: values.city,
        consent: values.consent,
        requestType: 'call',
        preferredContact: 'phone',
        message: values.message,
        sourcePage: location.pathname,
        landingPage: location.pathname,
        referrer: document.referrer,
      });
      setReference(response.data.data.reference || '');
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'We could not send your request. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function close() {
    if (busy) return;
    setOpen(false);
  }

  if (!open) return <button className="enquiry-popup-launcher" type="button" onClick={() => { window.clearTimeout(promptTimer.current); sessionStorage.setItem(SEEN_KEY, '1'); setOpen(true); }}><Phone size={17}/><span>Request a call</span></button>;

  return (
    <div className="enquiry-popup-backdrop" onClick={(event) => event.target === event.currentTarget && close()}>
      <section className="enquiry-popup" role="dialog" aria-modal="true" aria-labelledby="enquiry-popup-title">
        <header className="enquiry-popup-header">
          <div className="enquiry-popup-brand"><img src={siteImages['crome-india-logo'].url} alt="Crome India"/></div>
          <div className="enquiry-popup-heading"><span className="eyebrow">LET’S DISCUSS YOUR PROJECT</span><h2 id="enquiry-popup-title">Request a call from our team.</h2><p>Share your details and we’ll get in touch about your sports-surface enquiry.</p></div>
          <button className="enquiry-popup-close" type="button" aria-label="Close callback request" onClick={close} disabled={busy}><X size={21}/></button>
        </header>
        {reference ? (
          <div className="enquiry-popup-success" role="status">
            <span className="enquiry-popup-icon"><Phone size={20}/></span>
            <span className="eyebrow">REQUEST RECEIVED</span>
            <h2>Thank you. We’ll be in touch.</h2>
            <p>Your callback request is with the Crome India team.</p>
            <small>Reference: {reference}</small>
            <button className="button button-primary" type="button" onClick={close}>Continue browsing</button>
          </div>
        ) : (
          <form className="enquiry-popup-form" onSubmit={submit}>
            <div className="enquiry-popup-fields">
              <label htmlFor="callback-name">Name<input ref={nameRef} id="callback-name" name="name" autoComplete="name" minLength="2" maxLength="100" required placeholder="Your name" /></label>
              <label htmlFor="callback-phone">Phone number<input id="callback-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" pattern="[0-9+() .-]{7,24}" minLength="7" maxLength="24" required placeholder="Your phone number" /></label>
              <label htmlFor="callback-email">Email <span className="enquiry-popup-optional">Optional</span><input id="callback-email" name="email" type="email" autoComplete="email" maxLength="160" placeholder="you@example.com" /></label>
              <label htmlFor="callback-company">Company <span className="enquiry-popup-optional">Optional</span><input id="callback-company" name="company" autoComplete="organization" maxLength="140" placeholder="Company name" /></label>
              <label htmlFor="callback-sport">Sport or surface <span className="enquiry-popup-optional">Optional</span><select id="callback-sport" name="sport" defaultValue=""><option value="">Help me choose</option><option>Football</option><option>Cricket</option><option>Hockey</option><option>Tennis</option><option>Multisport</option><option>Other</option></select></label>
              <label htmlFor="callback-city">Project location <span className="enquiry-popup-optional">Optional</span><input id="callback-city" name="city" autoComplete="address-level2" maxLength="100" placeholder="City or area" /></label>
              <label className="enquiry-popup-message" htmlFor="callback-message">Message<textarea id="callback-message" name="message" minLength="4" maxLength="2000" required placeholder="Tell us a little about your project…" /></label>
            </div>
            <label className="enquiry-popup-consent"><input type="checkbox" name="consent" value="true" required/><span>I agree to receive a call about this enquiry.</span></label>
            {error && <p className="enquiry-popup-error" role="alert">{error}</p>}
            <button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Sending request…' : 'Request a call'} <ArrowUpRight size={17}/></button>
          </form>
        )}
      </section>
    </div>
  );
}
