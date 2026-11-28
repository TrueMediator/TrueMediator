import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { paths, render, publicUrl } from '../dist-ssr/entry-server.js';

const output = resolve('dist');
const template = await readFile(resolve(output, 'index.html'), 'utf8');
const escape = (value) => value.replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);

async function generate(path, filename) {
  const { html, metadata } = await render(path);
  let document = template.replace('<div id="app"></div>', () => `<div id="app">${html}</div>`);
  document = document.replace(/<title>.*?<\/title>/s, () => `<title>${escape(metadata.title)}</title>`);
  for (const [attribute, key, value] of [
    ['name', 'description', metadata.description],
    ['property', 'og:title', metadata.title],
    ['property', 'og:description', metadata.description],
    ['name', 'twitter:title', metadata.title],
    ['name', 'twitter:description', metadata.description],
  ]) {
    document = document.replace(new RegExp(`<meta\\s+${attribute}="${key}"\\s+content="[^"]*"\\s*/?>`),
      () => `<meta ${attribute}="${key}" content="${escape(value)}" />`);
  }
  document = document.replace('<!--page-metadata-->', () => [
    `<meta name="robots" content="${metadata.notFound ? 'noindex, follow' : 'index, follow'}" />`,
    metadata.canonical ? `<link rel="canonical" href="${escape(metadata.canonical)}" />` : '<link rel="canonical" />',
    metadata.canonical ? `<meta property="og:url" content="${escape(metadata.canonical)}" />` : '<meta property="og:url" />',
  ].join('\n    '));
  const destination = resolve(output, filename);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, document);
}

for (const path of paths) {
  await generate(path, `${path.slice(1)}index.html`);
}
await generate('/docs/not-found/', '404.html');
const start = publicUrl('/docs/getting-started/');
await mkdir(resolve(output, 'docs'), { recursive: true });
await writeFile(resolve(output, 'docs/index.html'), `<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>Documentation · TrueMediator</title><link rel="canonical" href="${start}"><meta http-equiv="refresh" content="0;url=${start}"></head><body><a href="${start}">Read the getting started guide</a></body></html>`);
await writeFile(resolve(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((path) => `  <url><loc>${escape(publicUrl(path))}</loc></url>`).join('\n')}\n</urlset>\n`);
await writeFile(resolve(output, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${publicUrl('/sitemap.xml').replace(/\/$/, '')}\n`);
await writeFile(resolve(output, '.nojekyll'), '');
await rm(resolve('dist-ssr'), { recursive: true, force: true });
console.log(`Generated ${paths.length} pages, a documentation redirect, 404.html, sitemap.xml, and robots.txt.`);
