import { useEffect, useRef, useState } from 'react';
import { siteImages } from '../data/images.js';

const introVideo = 'https://res.cloudinary.com/dt37ji5yp/video/upload/v1791310465/Logo_reveal_on_turf_1080p_20261006231504_gwr_video_mvp_zohsbg.mp4';

function signalSiteReady() {
  document.documentElement.classList.add('site-motion-ready');
  window.dispatchEvent(new Event('crome:intro-complete'));
}

/** Full-screen opening film, followed by a short Crome India brand reveal. */
export default function IntroAnimation() {
  const [phase, setPhase] = useState('video');
  const videoRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      signalSiteReady();
      setPhase('done');
      return () => { document.body.style.overflow = previousOverflow; };
    }

    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  // If the remote film stalls or never emits `ended`, hand off to the site anyway.
  useEffect(() => {
    if (phase !== 'video') return undefined;
    const watchdog = window.setTimeout(() => setPhase('branding'), 12000);
    return () => window.clearTimeout(watchdog);
  }, [phase]);

  useEffect(() => {
    if (phase === 'branding') {
      const fadeTimer = window.setTimeout(() => setPhase('fading'), 1900);
      return () => window.clearTimeout(fadeTimer);
    }
    if (phase === 'fading') {
      const finishTimer = window.setTimeout(() => {
        setPhase('done');
        document.body.style.overflow = '';
        signalSiteReady();
      }, 600);
      return () => window.clearTimeout(finishTimer);
    }
    return undefined;
  }, [phase]);

  const finish = () => {
    setPhase('done');
    document.body.style.overflow = '';
    signalSiteReady();
  };
  const showBrand = phase === 'branding' || phase === 'fading';

  if (phase === 'done') return null;

  return (
    <div className={`intro-overlay intro-phase-${phase}`}>
      {phase === 'video' && (
        <video
          ref={videoRef}
          className="intro-video"
          src={introVideo}
          poster={siteImages['home-hero-sports-surface'].url}
          autoPlay
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          onCanPlay={(event) => event.currentTarget.play().catch(() => setPhase('branding'))}
          onEnded={() => setPhase('branding')}
          onError={() => setPhase('branding')}
        />
      )}
      <div className={`intro-brand-card${showBrand ? ' intro-brand-card-visible' : ''}`} aria-live="polite">
        <span className="intro-brand-eyebrow">SPORTS SURFACES · SPORTS INFRASTRUCTURE</span>
        <div className="intro-logo-disc">
          <img src={siteImages['crome-india-logo'].url} alt="Crome India" className="intro-logo-img" />
        </div>
        <h1 className="intro-brand-name">CROME INDIA</h1>
        <p className="intro-tagline">Premium surfaces. Exceptional spaces.</p>
      </div>
      <button className="intro-skip" type="button" onClick={finish}>Skip intro <span aria-hidden="true">↗</span></button>
    </div>
  );
}
