<template>
  <v-app>
    <div class="loading" v-show="$apollo.loading"></div>

    <v-toolbar color="green" dark tabs class="app-header" v-if="$route.path !== '/'">
      <v-toolbar-title>School Festival 2019</v-toolbar-title>
      <v-spacer/>
      <v-select v-model="teamId" :items="teams" item-text="name" item-value="id"
                :disabled="teams.length === 1" label="団体" hide-details box
                style="max-width: 200px;width: 200px"/>
      <v-icon @click="$apollo.queries.teams.refetch()" style="margin: 0 20px 0 10px">
        refresh
      </v-icon>
      <v-btn class="blue darken-1" @click="logout">logout</v-btn>

      <v-tabs slot="extension" grow color="green" slider-color="yellow">
        <v-tab v-for="section in sections" :key="section.label" :to="section.to">
          {{ section.label }}
        </v-tab>
      </v-tabs>
    </v-toolbar>

    <v-content>
      <router-view/>
    </v-content>

    <v-bottom-nav :active.sync="navActive" :value="true" absolute color="white"
                  class="app-footer" v-if="$route.path.startsWith('/register')">
      <v-btn v-for="page in pages" :key="page.label" flat :color="page.color" :value="page.to">
        <span>{{ page.label }}</span>
        <v-icon>{{ page.icon }}</v-icon>
      </v-btn>
    </v-bottom-nav>
  </v-app>
</template>

<script>
import gql from 'graphql-tag';

export default {
  name: 'App',
  apollo: {
    teams: {
      query: gql`{
        user {
          teams {
            id
            name
          }
        }
      }`,
      skip() {
        return this.$route.path === '/';
      },
      manual: true,
      result({ data }) {
        this.teams = data.user.teams;
        this.$store.commit('setTeamId', this.teams[0].id);
      },
    },
  },
  data() {
    return {
      sections: [
        {
          label: 'home',
          to: '/home',
        },
        {
          label: 'register',
          to: '/register',
        },
        {
          label: 'Setting',
          to: '/setting',
        },
      ],
      pages: [
        {
          color: 'blue',
          label: 'Info',
          icon: 'info',
          to: '/register/info',
        }, {
          color: 'orange',
          label: 'Operation',
          icon: 'fa-cart-plus',
          to: '/register/operation',
        },
      ],
      teams: [],
    };
  },
  computed: {
    teamId: {
      get() {
        return this.$store.state.teamId;
      },
      set(val) {
        this.$store.commit('setTeamId', val);
      },
    },
    navActive: {
      get() {
        return this.$route.path === '/register' ? '/register/info' : this.$route.path;
      },
      set(val) {
        this.$router.push(val);
      },
    },
  },
  methods: {
    logout() {
      this.$http({
        method: 'get',
        url: '/logout',
      }).then(() => {
        localStorage.removeItem('tempToken');
        localStorage.removeItem('token');
        this.$router.push({ path: '/', query: { state: 'logout' } });
      });
    },
  },
};
</script>

<!--suppress CssInvalidFunction CssOverwrittenProperties -->
<style>
  html, body {
    overflow: hidden;
    padding: 0;
    margin: 0;
    width: 100%;
    height: 100%;
  }

  .v-btn.v-btn--floating.refetch-btn {
    position: fixed;
    bottom: calc(64px + constant(safe-area-inset-bottom));
    bottom: calc(64px + env(safe-area-inset-bottom));
    right: 16px;
  }

  .app-footer-margin {
    padding-bottom: calc(56px + 64px + constant(safe-area-inset-bottom)) !important;
    padding-bottom: calc(56px + 64px + env(safe-area-inset-bottom)) !important;
  }
</style>

<!--suppress CssInvalidFunction CssOverwrittenProperties -->
<style lang="scss" scoped>
  .loading {
    z-index: 1000;
    position: fixed;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .v-content {
    min-width: 100%;
    width: 100%;
    max-width: 100%;
    min-height: 100%;
    height: 100%;
    max-height: 100%;
    overflow: scroll;
  }

  .app-header {
    z-index: 5;
    position: fixed;
    top: 0;

    & + .v-content {
      padding-top: 110px !important;
    }
  }

  .app-footer {
    z-index: 5;
    position: fixed;
    bottom: 0;

    height: auto !important;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
  }
</style>
