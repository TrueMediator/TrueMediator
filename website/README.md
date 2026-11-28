# TrueMediator website

TrueMediator marketing site and documentation, built with Vue 3, TypeScript, and Vite.

Requires Node.js `^22.18.0 || >=24.12.0` and npm.

Run commands from this directory:

```sh
npm ci
npm run dev
```

`npm run build` checks types and builds production files in `dist/`.
`npm run preview` serves the production build locally.

## GitHub Pages deployment

The production URL is https://truemediator.github.io/TrueMediator/.
Vite's base is `/TrueMediator/`; generated pages, the history router, and asset URLs use that same base.
The development and preview servers also serve the site under `/TrueMediator/`.

In `TrueMediator/TrueMediator`, set **Settings → Pages → Build and deployment → Source**
to **GitHub Actions** and remove any previous custom domain. The `github-pages`
environment must allow deployments from `master`. The deployment workflow builds
and publishes `website/dist` on pushes to `master` or through **Run workflow**.
No `CNAME` file is needed for this GitHub-hosted address.

## Adoption funnel

The home page moves visitors through the product promise, code examples, benefits, benchmark evidence, adoption questions, and quick start. The getting started guide provides a runnable console example. The evaluation guide supports compatibility decisions. Documentation points visitors onward to implementation and the clean architecture sample.

Primary conversion intent: quick-start visits and successful install-command copies. Secondary intent: evaluation visits, sample exploration, GitHub, and NuGet clicks. A click or clipboard copy does not prove a package install or successful adoption.

`src/funnel.ts` emits local `truemediator:conversion` CustomEvents with `name`, `placement`, and optional `destination`. Events are `quick_start_click`, `evaluation_click`, `github_click`, `nuget_click`, and `install_copy`. No analytics provider, cookies, persistent identifiers, or network collection is configured. Connect your chosen analytics provider to this event before relying on conversion reports; handle consent as appropriate for that provider. Destination values omit query strings and are limited to recognized links.

For example, a provider adapter can subscribe with:

```js
window.addEventListener("truemediator:conversion", ({ detail }) => {
  // Forward detail to your configured analytics provider.
});
```

The build statically renders the homepage, privacy policy, and every Markdown documentation page using Vue's server renderer. Each URL has its own `index.html` with complete content, title, description, canonical URL, and social metadata. The browser hydrates that HTML for interactive examples, navigation, and copying the install command. No application server is needed.

Clean directory URLs such as `/TrueMediator/docs/getting-started/` work directly on GitHub Pages because each page is emitted to a matching directory. Legacy `#/docs/...` bookmarks redirect in the browser to the generated URL, preserving heading fragments and query parameters. `/docs/` redirects to the getting started guide. Unknown URLs receive GitHub Pages' generated `404.html` with `noindex` metadata.

`src/seo.ts` defines the production origin and page descriptions. Update the origin and Vite base if hosting changes. `npm run build` builds client assets, builds a temporary server renderer, generates pages, and removes the temporary renderer. `npm run verify-ssg` verifies the generated HTML and internal links after a build. New Markdown guides are included automatically.

The build also writes `sitemap.xml`, `robots.txt`, and `.nojekyll` into `dist/`. Submit `https://truemediator.github.io/TrueMediator/sitemap.xml` in Google Search Console after deployment. Crawlers only honor `robots.txt` at the domain root; the project-level `/TrueMediator/robots.txt` is not authoritative. If you manage the `truemediator.github.io` root site, publish its robots file there and reference this sitemap.

Keep benchmark data synchronized with the linked repository reports and retain their methodology caveats. Do not present exploratory measurements as production guarantees.

## Documentation

Documentation is rendered from Markdown files in `src/docs/`. Add a `.md` file with a level-one heading (`# Page title`) to create a page and automatically include it in the sidebar. Getting started appears first; other pages are sorted by title.

Link between guides using relative Markdown links, for example `[Pipeline behaviors](pipeline-behaviors.md)`. Level-two headings populate the page's table of contents. Raw HTML is disabled in Markdown.

Open `/TrueMediator/docs/getting-started/` in the local dev server. Production builds generate a directory index for every known page, so GitHub Pages needs no application route rewrites. Changes to Markdown update through Vite; production updates require a new build.

## GitHub wiki

The `Sync documentation to wiki` workflow publishes `src/docs/*.md` to the repository wiki when these files change on `master`. It can also be run manually from Actions. `getting-started.md` becomes `Home.md`; local page links are adjusted and a sidebar is generated.

One-time setup:

1. Enable **Wikis** in the repository's **Settings → General → Features**, then create the first wiki page on GitHub.
2. Add an Actions repository secret named `WIKI_TOKEN` containing a token with permission to push to the wiki. For a public repository, a classic personal access token with `public_repo` scope can be used; it must belong to an account with repository write access.
3. Run **Sync documentation to wiki** from the Actions tab.

Edit documentation here and submit changes through pull requests. The wiki's root Markdown pages are generated: manual edits are overwritten, and pages removed from this directory are removed from the wiki. Git history is retained.
