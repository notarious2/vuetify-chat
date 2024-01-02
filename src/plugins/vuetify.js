/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Composables
import { createVuetify } from "vuetify";

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'teal',
    themes: {
      midnight: {
        colors: {
          icons: "#78909C", // Dark gray or black
          secondary: "#FFA000", // Dark yellow or gold
          background: "#ECEFF1",
          primary: "#ffffff", // White icons for contrast
          panel: "#263238", // Dark panel color
          items: "#37474f", // Dark items color
          select: "#FFA000", // Dark yellow or gold for select elements
          scroll: "#BDBDBD", //grey-lighten-1
          track: "#1a1a1a", // Dark scrollbar track color
          submenu: "#E0E0E0", //grey-lighten-2
          appbar: '#546E7A', //cyan-lighten-4
          logoleft: "#263238", //teal-lighten-3
          logoright: "#ffffff", //teal-darken-2
          send: '#263238', //blue-grey-darken-4
        },
      },
      teal: {
        colors: {
          background: "#F5F5F5", //grey-lighten-4
          primary: "#009688", // teal
          secondary: "#7986CB",
          icons: "#80CBC4", // teal-lighten-3
          panel: "#B2DFDB", // teal-lighten-4
          items: "#E0F2F1", // teal-lighten-5
          select: "#26A69A", //teal-lighten-1
          scroll: "#009688", //teal
          track: "#b2e6e1", // scrollbar-track
          submenu:  "#E0F2F1", // teal-lighten-5
          appbar: '#B2DFDB', //teal-lighten-4
          logoleft: "#80CBC4", //teal-lighten-3
          logoright: "#00796B", //teal-darken-2
          send: "#009688", // teal
        },
      },
    },

  },
});
