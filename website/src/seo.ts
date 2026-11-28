import { documents } from "./docs";

export const siteOrigin = "https://truemediator.github.io";
export const siteBase = import.meta.env.BASE_URL;
export const pagePath = (path: string) => path === "/" ? "/" : `${path.replace(/\/+$/, "")}/`;
export const publicUrl = (path: string) => `${siteOrigin}${siteBase}${pagePath(path).slice(1)}`;

const guideDescriptions: Record<string, string> = {
  "getting-started": "Install TrueMediator and build your first .NET request handler with source-generated registration, dependency injection, and Native AOT support.",
  "evaluating": "Evaluate TrueMediator for your .NET project: compare mediator features, supported frameworks, Native AOT support, and registration requirements.",
  "pipeline-behaviors": "Build ordered TrueMediator pipeline behaviors for .NET request handlers, including validation, logging, retries, and short-circuiting.",
  "notifications": "Publish TrueMediator notifications to multiple .NET handlers with sequential, parallel, or custom execution strategies and cancellation support.",
  "streaming": "Stream .NET request results with TrueMediator using IAsyncEnumerable, stream request handlers, cancellation, and stream pipeline behaviors.",
  "fluentvalidation": "Add asynchronous FluentValidation to TrueMediator request pipelines. Register validators, aggregate failures, and configure validation behavior ordering.",
  "entity-framework-core": "Use opt-in Entity Framework Core transactions with TrueMediator requests. Configure transaction attributes, database contexts, commit, and rollback."
};

export function pageMetadata(path: string) {
  const cleanPath = path.replace(/\/+$/, "") || "/";
  const page = documents.find((doc) => cleanPath === `/docs/${doc.slug}`);
  const notFound = cleanPath !== "/" && cleanPath !== "/privacy" && !page;
  return {
    title: cleanPath === "/"
      ? "TrueMediator — Source-generated mediator for .NET with Native AOT"
      : cleanPath === "/privacy" ? "Privacy policy · TrueMediator"
      : `${page?.title ?? "Page not found"} · TrueMediator`,
    description: cleanPath === "/"
      ? "A free, MIT-licensed mediator for .NET with source-generated dispatch, Native AOT support, CQRS, ordered pipelines, notifications, and streaming."
      : cleanPath === "/privacy"
      ? "How the TrueMediator website handles hosting logs, local interaction events, cookies, and privacy questions."
      : (page && guideDescriptions[page.slug]) || "Explore TrueMediator documentation and examples for .NET requests, pipeline behaviors, notifications, and streaming.",
    canonical: notFound ? undefined : publicUrl(cleanPath),
    notFound,
  };
}

export function updateMetadata(path: string) {
  const meta = pageMetadata(path);
  document.title = meta.title;
  for (const [selector, content] of [
    ['meta[name="description"]', meta.description],
    ['meta[property="og:title"]', meta.title],
    ['meta[property="og:description"]', meta.description],
    ['meta[name="twitter:title"]', meta.title],
    ['meta[name="twitter:description"]', meta.description],
    ['meta[name="robots"]', meta.notFound ? "noindex, follow" : "index, follow"],
  ]) {
    document.querySelector(selector!)?.setAttribute("content", content!);
  }
  for (const [selector, attribute] of [
    ['link[rel="canonical"]', "href"],
    ['meta[property="og:url"]', "content"],
  ]) {
    const element = document.querySelector(selector!);
    if (meta.canonical) element?.setAttribute(attribute!, meta.canonical);
    else element?.removeAttribute(attribute!);
  }
}
