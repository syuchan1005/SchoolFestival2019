import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  /* eslint-disable no-param-reassign */
  state: {
    teamId: -1,
    isPWA: false,
  },
  getters: {
  },
  mutations: {
    setTeamId(state, id) {
      state.teamId = id;
    },
    setPWA(state, pwa) {
      state.isPWA = pwa;
    },
  },
  actions: {
  },
});
