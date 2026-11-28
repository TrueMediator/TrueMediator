import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const output = resolve('dist');
const sitemap = await readFile(resolve(output, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]));
assert(urls.length >= 3, 'Sitemap must contain the homepage, privacy policy, and guides');
const titles = new Set();
for (const url of urls) {
  const relative = url.pathname.replace('/TrueMediator/', '');
  const html = await readFile(resolve(output, relative, 'index.html'), 'utf8');
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
  assert(title && !titles.has(title), `Missing or duplicate title: ${url}`);
  titles.add(title);
  assert(html.includes(`<link rel="canonical" href="${url.href}"`), `Wrong canonical: ${url}`);
  assert.match(html, /<meta name="description" content="[^"]+"/);
  assert.match(html, /<meta property="og:url" content="https:/);
  assert.match(html, /<h1[\s>]/, `No prerendered heading: ${url}`);
  assert(!html.includes('<div id="app"></div>'), `Empty app: ${url}`);
  assert(!html.includes('<!--page-metadata-->'), `Unexpanded metadata: ${url}`);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = new URL(match[1].replaceAll('&amp;', '&'), url);
    if (target.origin !== url.origin) continue;
    assert(!target.hash.startsWith('#/'), `Legacy hash link: ${target}`);
    assert(target.pathname.startsWith('/TrueMediator/'), `Link escapes hosting base: ${target}`);
    let file = resolve(output, decodeURIComponent(target.pathname.slice('/TrueMediator/'.length)));
    const info = await stat(file).catch(() => null);
    assert(info, `Missing internal destination: ${target}`);
    if (info.isDirectory()) file = resolve(file, 'index.html');
    const content = await readFile(file);
    if (target.hash && file.endsWith('.html')) {
      assert(content.toString().includes(`id="${decodeURIComponent(target.hash.slice(1))}"`), `Missing heading: ${target}`);
    }
  }
}
const notFound = await readFile(resolve(output, '404.html'), 'utf8');
assert.match(notFound, /noindex, follow/);
assert.match(notFound, /Page not found/);
assert(!notFound.includes('rel="canonical" href='), '404 must not advertise a canonical page');
assert((await readFile(resolve(output, 'robots.txt'), 'utf8')).includes('https://truemediator.github.io/TrueMediator/sitemap.xml'));
await stat(resolve(output, '.nojekyll'));
console.log(`Verified content, metadata, assets, internal links, and anchors for ${urls.length} generated pages.`);
