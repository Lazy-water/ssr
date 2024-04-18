import { createSSRApp } from "vue";
import router from "./router";
import App from "./App.vue";

export const createApp = () => {
  const app = createSSRApp(App);
  app.use(router)
  return { app, router };
};