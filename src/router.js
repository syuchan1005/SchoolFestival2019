import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import Graph from './views/Graph.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/graph',
      name: 'graph',
      component: Graph,
    },
  ],
});
