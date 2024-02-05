/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import { loadFonts } from "./webfontloader";
import vuetify from "./vuetify";
import pinia from "../store";
import router from "../router";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import VueGtag from "vue-gtag";

pinia.use(piniaPluginPersistedstate);

export function registerPlugins(app) {
  loadFonts();
  app
    .use(vuetify)
    .use(router)
    .use(pinia)
    .use(VueGtag, {
      config: { id: import.meta.env.VITE_GA_MEASUREMENT_ID },
    });
}
