import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    loadings: {},
    teamId: -1,
    teams: [],
  },
  getters: {
    isLoading(state) {
      return Object.values(state.loadings).some(v => !!v);
    },
  },
  mutations: {
    /* eslint-disable no-param-reassign */
    setLoading(state, { name, value }) {
      state.loadings = {
        ...state.loadings,
        [name]: value,
      };
    },
    setTeamId(state, id) {
      state.teamId = id;
    },
    setTeams(state, teams) {
      state.teams = teams;
    },
  },
  actions: {
    loadTeams({ commit }) {
      commit('setLoading', { name: 'store-loadteam', value: true });
      Vue.prototype.$http({
        url: '/api/teams/name',
      }).then((res) => {
        commit('setLoading', { name: 'store-loadteam', value: false });
        commit('setTeams', res.data);
        commit('setTeamId', res.data[0].id);
      }).catch(() => {
        commit('setLoading', { name: 'store-loadteam', value: false });
      });
    },
  },
});
