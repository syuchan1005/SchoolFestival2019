import Vue from 'vue';
import axios from 'axios';
import './plugins/vuetify';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';

Vue.config.productionTip = false;

Vue.mixin({
  mounted() {
    let { title } = this.$options;
    if (title) {
      title = typeof title === 'function' ? title.call(this) : title;
      document.title = title;
    }
  },
});

Vue.prototype.$http = axios;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
