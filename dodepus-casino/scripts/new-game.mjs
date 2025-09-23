#!/usr/bin/env node
// Usage:
//   node scripts/new-game.mjs <provider> <game-slug> [--title "Nice Title"]
//
// Пример:
//   node scripts/new-game.mjs LuckySoft Lucky777 --title "Lucky 777"

import { promises as fs } from 'fs';
import path from 'path';

function slugify(s) {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const [, , providerArg, gameArg, ...rest] = process.argv;

if (!providerArg || !gameArg) {
  console.error(
    'Usage: node scripts/new-game.mjs <provider> <game-slug> [--title "Nice Title"]'
  );
  process.exit(1);
}

const titleFlag = rest.indexOf('--title');
const title =
  titleFlag !== -1 && rest[titleFlag + 1] ? rest[titleFlag + 1] : gameArg;

const providerSlug = slugify(providerArg);
const gameSlug = slugify(gameArg);

const root = process.cwd();
const dir = path.join(root, 'public', 'games', providerSlug, gameSlug);
const htmlPath = path.join(dir, 'index.html');

await fs.mkdir(dir, { recursive: true }).catch(() => {});

try {
  await fs.access(htmlPath);
  console.log(`⚠️  Уже существует: ${path.relative(root, htmlPath)}`);
  process.exit(0);
} catch {
  // ок, файла нет — создадим
}

const html = `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
  <title>${title} — ${providerArg}</title>
  <style>
    :root { --bg:#0f1216; --card:#171b21; --text:#e5e7eb; --muted:#9aa3af; --radius:16px; }
    *{box-sizing:border-box} html,body{height:100%}
    body{margin:0;background:radial-gradient(1000px 500px at 50% 0%, #10151c 0%, #0b0f14 60%, #0a0d12 100%), var(--bg);
      color:var(--text); font:14px/1.5 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif; display:grid; place-items:center}
    .wrap{width:min(960px,92vw); height:min(540px,52vw); background:var(--card); border:1px solid #1f242c; border-radius:var(--radius);
      box-shadow:0 10px 30px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.03); display:grid; gap:14px; padding:20px;
      grid-template-rows:auto 1fr}
    .top{display:flex; align-items:center; justify-content:space-between}
    .muted{color:var(--muted)}
    .area{border:1px solid #212731; border-radius:12px; display:grid; place-items:center}
    .tag{display:inline-block; font-size:12px; padding:4px 8px; border:1px solid #2a3140; border-radius:999px; color:var(--muted)}
    .btn{border:1px solid #2a3140; background:#141922; color:#e5e7eb; padding:8px 12px; border-radius:10px; cursor:pointer}
    .btn:active{transform:translateY(1px)}
  </style>
</head>
<body>
  <div class="wrap" role="application" aria-label="${title}">
    <div class="top">
      <div><strong>${title}</strong> <span class="tag">${providerArg}</span></div>
      <div class="muted">Пакет загружается из <code>/public/games/${providerSlug}/${gameSlug}/</code></div>
    </div>

    <div class="area" id="area">
      <p class="muted">Здесь холст игры. Замените этот файл своим билдом/игрой.</p>
      <button class="btn" id="ping">Сообщить родителю (GAME_READY)</button>
    </div>
  </div>

  <script>
    // Пример: сообщить родителю, что игра готова
    document.getElementById('ping').addEventListener('click', () => {
      try { window.parent && window.parent.postMessage({ type: 'GAME_READY', game: '${gameSlug}' }, '*'); } catch(e) {}
    });
  </script>
</body>
</html>
`;

await fs.writeFile(htmlPath, html, 'utf8');
console.log('✅ Создано:', path.relative(root, htmlPath));
console.log('➡️  Открой маршрут: /game/%s/%s', providerSlug, gameSlug);
console.log('ℹ️  Добавь фикстуру в src/data/games.js (providerSlug, slug, title, provider, ...).');
