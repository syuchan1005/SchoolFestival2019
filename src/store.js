import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    loadings: {},
  },
  getters: {
    isLoading(state) {
      return Object.values(state.loadings).some(v => !!v);
    },
  },
  mutations: {
    setLoading(state, { name, value }) {
      // eslint-disable-next-line no-param-reassign
      state.loadings = {
        ...state.loadings,
        [name]: value,
      };
    },
  },
  actions: {

  },
});
