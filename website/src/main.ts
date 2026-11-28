import { createApp, createSSRApp } from "vue";
import "@fontsource-variable/inter";
import App from "./App.vue";
import { createSiteRouter } from "./router";
import "./style.css";
import { installFunnelHooks } from "./funnel";

// Old bookmarks used /TrueMediator/#/docs/... . Load the generated destination
// before hydrating so its HTML and the client route always agree.
function redirectLegacyHash() {
  if (!location.hash.startsWith("#/")) return false;
  const legacy = new URL(`.${location.hash.slice(1)}`, location.origin + import.meta.env.BASE_URL);
  legacy.pathname = legacy.pathname.replace(/\/?$/, "/");
  location.replace(legacy.href);
  return true;
}
window.addEventListener("hashchange", redirectLegacyHash);

if (!redirectLegacyHash()) {
  const router = createSiteRouter();
  const rendered = document.querySelector("#app")?.hasChildNodes()
    && document.querySelector('meta[name="robots"]')?.getAttribute("content") !== "noindex, follow";
  const app = (rendered ? createSSRApp : createApp)(App);
  app.use(router);
  router.isReady().then(() => {
    installFunnelHooks();
    app.mount("#app");
  });
}
