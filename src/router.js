import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';

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
      component: () => import(/* webpackChunkName: "authed" */ './views/Information.vue'),
    },
    {
      path: '/setting',
      name: 'setting',
      component: () => import(/* webpackChunkName: "authed" */ './views/Setting.vue'),
    },
    {
      path: '/operation',
      name: 'operation',
      component: () => import(/* webpackChunkName: "authed" */ './views/Operation.vue'),
    },
  ],
});

export default router;
