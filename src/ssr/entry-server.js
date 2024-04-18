import { renderToString } from "vue/server-renderer";
import { createApp } from "./../main";

export const render = async (url) => {
  const { app, router } = createApp();

  await router.push(url);
  await router.isReady();

  // 设置title
  const to = router.currentRoute;
  const title = to.value?.meta.title || "ssr";
  const head = to.value?.meta.head || "";

  const ctx = { modules: null };
  const html = await renderToString(app, ctx);

  return { html, title, head };
};
