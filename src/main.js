import Vue from 'vue'
import VueHtmlToPaper from 'vue-html-to-paper'
import VMask from 'v-mask'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import authConfig from '../auth_config.json'
import VueToast from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const publicPath = process.env.BASE_URL

const options = {
  name: '_blank',
  timeout: 1000,
  autoClose: true,
  windowTitle: 'Imprimir',
  specs: [
    'fullscreen=yes',
    'titlebar=yes',
    'scrollbars=yes'
  ],
  styles: [
    'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css',
    'https://unpkg.com/kidlat-css/css/kidlat.css',
    `${publicPath}printer.css`
  ],
}
Vue.use(VMask)
Vue.use(VueHtmlToPaper, options)
Vue.use(VueToast, {
  duration: 5000,
  position: "bottom",
  dismissible: true,

})

Vue.config.productionTip = false


Vue.prototype.$user = {
  clientId: authConfig.clientId,
  name:'Hector Vera',
  token:''
}
new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
