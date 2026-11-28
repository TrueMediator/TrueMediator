import { createRouter, createMemoryHistory, createWebHistory } from "vue-router";
import { pagePath, updateMetadata } from "./seo";

export function createSiteRouter() {
  const router = createRouter({
    history: import.meta.env.SSR
      ? createMemoryHistory(import.meta.env.BASE_URL)
      : createWebHistory(import.meta.env.BASE_URL),
    routes: [
      { path: "/", component: () => import("./views/HomeView.vue") },
      { path: "/privacy/", component: () => import("./views/PrivacyView.vue") },
      { path: "/docs/", redirect: "/docs/getting-started/" },
      { path: "/docs/:slug(.*)", component: () => import("./views/DocsView.vue") },
      { path: "/:pathMatch(.*)*", component: () => import("./views/DocsView.vue") },
    ],
    scrollBehavior(to, _from, saved) {
      if (saved) return saved;
      if (to.hash) return { el: to.hash, top: 24 };
      return { top: 0 };
    },
  });
  router.beforeEach((to) => {
    const path = pagePath(to.path);
    if (path !== to.path) return { path, query: to.query, hash: to.hash, replace: true };
  });
  if (!import.meta.env.SSR) router.afterEach((to) => updateMetadata(to.path));
  return router;
}
