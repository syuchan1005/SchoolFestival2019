import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  /* eslint-disable no-param-reassign */
  state: {
    teamId: -1,
  },
  getters: {
  },
  mutations: {
    setTeamId(state, id) {
      state.teamId = id;
    },
  },
  actions: {
  },
});
