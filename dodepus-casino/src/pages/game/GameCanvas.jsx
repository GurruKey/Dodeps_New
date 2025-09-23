import { useEffect, useState, memo } from 'react';
import { Card, Button, Alert, Placeholder } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function looksLikeSpaHtml(text) {
  return /<div\s+id=["']root["']>/i.test(text) || /@vite\/client/.test(text);
}

/**
 * Полотно игры: проверяет наличие файла пакета и встраивает iframe.
 * Props:
 * - providerSlug: string
 * - gameSlug: string
 * - title: string
 * - providerName: string
 */
function GameCanvas({ providerSlug, gameSlug, title, providerName }) {
  const src =
    providerSlug && gameSlug
      ? `/games/${providerSlug}/${gameSlug}/index.html`
      : null;

  const [status, setStatus] = useState('checking'); // 'checking' | 'ok' | 'missing'
  const [checkError, setCheckError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStatus('checking');
    setCheckError('');
    if (!src) return;

    (async () => {
      try {
        const res = await fetch(src, { method: 'GET', cache: 'no-store' });
        const text = await res.text();
        const ok = res.ok && !looksLikeSpaHtml(text);
        if (!cancelled) setStatus(ok ? 'ok' : 'missing');
      } catch (e) {
        if (!cancelled) {
          setStatus('missing');
          setCheckError(String(e?.message || 'Network error'));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <>
      <Card.Title className="mb-3">{title}</Card.Title>

      {status === 'checking' && (
        <div className="ratio ratio-16x9">
          <Card className="w-100 h-100 border-0">
            <Card.Body>
              <Placeholder as="p" animation="wave" className="mb-2">
                <Placeholder xs={12} />
              </Placeholder>
              <Placeholder as="p" animation="wave" className="mb-2">
                <Placeholder xs={10} />
              </Placeholder>
              <Placeholder as="p" animation="wave">
                <Placeholder xs={8} />
              </Placeholder>
            </Card.Body>
          </Card>
        </div>
      )}

      {status === 'missing' && (
        <>
          <Alert variant="danger" className="mb-2">
            Не найден файл пакета игры:&nbsp;
            <code>/public/games/{providerSlug}/{gameSlug}/index.html</code>
          </Alert>
          <div className="d-flex gap-2">
            <Button as={Link} to="/lobby" variant="outline-secondary" size="sm">
              В лобби
            </Button>
            {src && (
              <a
                className="btn btn-outline-primary btn-sm"
                href={src}
                target="_blank"
                rel="noreferrer"
              >
                Проверить напрямую
              </a>
            )}
          </div>
          {checkError && (
            <div className="small text-muted mt-2">Тех. детали: {checkError}</div>
          )}
        </>
      )}

      {status === 'ok' && src && (
        <div className="ratio ratio-16x9">
          <iframe
            src={src}
            title={`${title} — ${providerName}`}
            className="w-100 h-100 border-0"
            allow="clipboard-read; clipboard-write; autoplay; gamepad"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      )}
    </>
  );
}

export default memo(GameCanvas);
