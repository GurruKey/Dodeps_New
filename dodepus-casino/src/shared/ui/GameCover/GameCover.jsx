import { useEffect, useState } from 'react';

// Пытаемся найти картинку рядом с index.html пакета:
// /public/games/<provider>/<slug>/{cover,thumb,poster}.{webp,png,jpg,jpeg,gif}
const NAMES = ['cover', 'thumb', 'poster'];
const EXTS = ['webp', 'png', 'jpg', 'jpeg', 'gif'];

export default function GameCover({
  providerSlug,
  slug,
  src: explicitSrc,     // если в фикстуре указан путь — используем его
  alt = 'Game cover',
  className = '',
}) {
  const [src, setSrc] = useState(explicitSrc || null);

  useEffect(() => {
    let cancelled = false;

    if (explicitSrc) {
      setSrc(explicitSrc);
      return;
    }

    const base = `/games/${providerSlug}/${slug}/`;

    (async () => {
      for (const name of NAMES) {
        for (const ext of EXTS) {
          const url = `${base}${name}.${ext}`;
          try {
            const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
            if (res.ok) {
              if (!cancelled) setSrc(url);
              return;
            }
          } catch {
            /* ignore */
          }
        }
      }
      if (!cancelled) setSrc(null); // не нашли — покажем заглушку
    })();

    return () => {
      cancelled = true;
    };
  }, [providerSlug, slug, explicitSrc]);

  // Заглушка, если ничего не нашли
  if (!src) {
    return (
      <div
        className={
          'ratio ratio-16x9 rounded bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center border ' +
          className
        }
      >
        <span className="text-muted">Preview</span>
      </div>
    );
  }

  return (
    <div className={'ratio ratio-16x9 ' + className}>
      <img
        src={src}
        alt={alt}
        className="w-100 h-100 rounded border"
        style={{ objectFit: 'cover' }}
        loading="lazy"
      />
    </div>
  );
}
