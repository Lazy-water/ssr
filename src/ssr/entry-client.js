import "./../assets/main.css";
import { createApp } from "./../main";

const { app, router } = createApp();

router.beforeResolve((to, from, next) => {
  document.title = to.meta?.title || 'ssr'
  const dom = document.getElementsByTagName('head')[0]
  dom.insertAdjacentHTML('beforeend', to.meta?.head)
  next()
})

router.isReady().then(() => app.mount("#app"))
