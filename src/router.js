import Vue from 'vue';
import Router from 'vue-router';
import Top from './views/Top.vue';

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'top',
      component: Top,
    },
    {
      path: '/home',
      name: 'home',
      component: () => import(/* webpackChunkName: "authed" */ './views/Home.vue'),
    },
    {
      path: '/setting',
      name: 'setting',
      component: () => import(/* webpackChunkName: "authed" */ './views/Setting.vue'),
    },
    {
      alias: '/register',
      path: '/register/info',
      name: 'information',
      component: () => import(/* webpackChunkName: "authed" */ './views/Information.vue'),
    },
    {
      path: '/register/operation',
      name: 'operation',
      component: () => import(/* webpackChunkName: "authed" */ './views/Operation.vue'),
    },
  ],
});

export default router;
