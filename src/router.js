import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import Information from './views/Information.vue';
import Setting from './views/Setting.vue';

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/info',
      name: 'information',
      component: Information,
    },
    {
      path: '/setting',
      name: 'setting',
      component: Setting,
    },
  ],
});

export default router;
