import { useCallback, useEffect, useRef, useState } from 'react';

function readReducedMotionPreference() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Responsive, accessible wrapper for approved .lottie or .json assets.
 * Put animation files in client/public/animations and pass a URL such as
 * `/animations/sports-surface.lottie` as `src`.
 */
export default function LottieAnimation({
  src,
  label,
  loop = true,
  autoplay = true,
  className = '',
  style,
  aspectRatio = '1 / 1',
  fallback = <span className="lottie-loading-fallback" aria-hidden="true"/>,
  dotLottieRefCallback,
  ...playerProps
}) {
  const [reducedMotion, setReducedMotion] = useState(readReducedMotionPreference);
  const [Player, setPlayer] = useState(null);
  const [failed, setFailed] = useState(false);
  const playerRef = useRef(null);
  const onLoadError = useCallback(() => setFailed(true), []);
  const handlePlayer = useCallback(instance => {
    if (playerRef.current) playerRef.current.removeEventListener('loadError', onLoadError);
    playerRef.current = instance;
    if (instance) instance.addEventListener('loadError', onLoadError);
    dotLottieRefCallback?.(instance);
  }, [dotLottieRefCallback, onLoadError]);

  useEffect(() => {
    let active = true;
    import('@lottiefiles/dotlottie-react')
      .then(({ DotLottieReact: PlayerComponent }) => {
        if (active) setPlayer(() => PlayerComponent);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = event => setReducedMotion(event.matches);
    query.addEventListener?.('change', updatePreference);
    return () => query.removeEventListener?.('change', updatePreference);
  }, []);

  useEffect(() => () => {
    if (playerRef.current) playerRef.current.removeEventListener('loadError', onLoadError);
  }, [onLoadError]);

  if (!src) return null;

  return (
    <div
      className={`lottie-frame${className ? ` ${className}` : ''}`}
      style={{ aspectRatio, ...style }}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
    >
      {failed || !Player ? fallback : <Player
        {...playerProps}
        src={src}
        loop={loop && !reducedMotion}
        autoplay={autoplay && !reducedMotion}
        className="lottie-frame-canvas"
        dotLottieRefCallback={handlePlayer}
        aria-hidden="true"
      />}
    </div>
  );
}
