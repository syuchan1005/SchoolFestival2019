import 'babel-polyfill';

import Vue from 'vue';

import axios from 'axios';
import ApolloClient from 'apollo-boost';
import VueApollo from 'vue-apollo';

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

let apolloClient;
if (process.env.NODE_ENV !== 'production' && window.location.hostname === 'localhost') {
  const baseURL = 'http://localhost:8080';
  Vue.prototype.$http = axios.create({
    baseURL,
  });
  apolloClient = new ApolloClient({ uri: `${baseURL}/graphql` });
} else {
  Vue.prototype.$http = axios;
  apolloClient = new ApolloClient({ uri: `${window.location.origin}/graphql` });
}
Vue.prototype.$http.defaults.withCredentials = true;

Vue.use(VueApollo);

new Vue({
  router,
  store,
  apolloProvider: new VueApollo({ defaultClient: apolloClient }),
  render: h => h(App),
}).$mount('#app');
