import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import App from "./App.vue";
import { createSiteRouter } from "./router";
import { documents } from "./docs";
import { pageMetadata, publicUrl } from "./seo";

export const paths = ["/", "/privacy/", ...documents.map((doc) => `/docs/${doc.slug}/`)];
export { publicUrl };

export async function render(path: string) {
  const router = createSiteRouter();
  const app = createSSRApp(App).use(router);
  await router.push(path);
  await router.isReady();
  return {
    html: await renderToString(app),
    metadata: pageMetadata(router.currentRoute.value.path),
  };
}
