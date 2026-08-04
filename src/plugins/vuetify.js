import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
      options: {
        customProperties: true,
      },
    themes: {
      light: {
        primary: '#005F73',
        primary100: '#0A9396',
        secondary100: '#FBE0C6',
        secondary: '#CA6702',
        background: '#F0F0F0',
        background100: '#e3e3e3',
        accent: '#001219',
        error: '#AE2012',
        info: '#0A9396',
        success: '#94D2BD',
        warning: '#EE9B00',
        complement: '#001219',
        sidebar: '#E9D8A6',
        sidebarlite: '#F5EED8',
        gray: '#E4F1ED',
        gray100: '#EEEEEE',
        gray300: '#8D9593',
        texto: '#212121',
        orange: '#EE9B00',
        darkgray: '#001219',
        blue200: '#B3DFE8',
        lightcyan: '#E6F4F7',
        redlagoon: '#9B2226',
        bluebackground: '#192930', 
        cardhome: '#BA2E45',
      },
    },
  },
});
