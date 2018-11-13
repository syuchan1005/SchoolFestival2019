<template>
  <v-app>
    <div class="loading" v-show="isLoading"></div>

    <v-toolbar color="green" dark tabs v-show="$route.path !== '/'">
      <v-toolbar-title>School Festival 2019</v-toolbar-title>
      <v-spacer/>
      <v-btn class="blue darken-1" href="/line/logout">logout</v-btn>

      <v-tabs slot="extension" grow color="green" slider-color="yellow">
        <v-tab v-for="name in pages" :key="name" :to="name">{{ name }}</v-tab>
      </v-tabs>
    </v-toolbar>

    <v-content>
      <keep-alive>
        <router-view/>
      </keep-alive>
    </v-content>
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'App',
  data() {
    return {
      pages: ['info', 'operation', 'setting'],
    };
  },
  computed: {
    ...mapGetters(['isLoading']),
  },
};
</script>

<style>
  html {
    overflow: auto;
  }

  html, body {
    padding: 0;
    margin: 0;
    width: 100%;
    height: 100%;
  }

  /* noinspection All */
  .application {
    /* eslint-disable */
    padding-top: constant(safe-area-inset-top);
    padding-right: constant(safe-area-inset-right);
    padding-bottom: constant(safe-area-inset-bottom);
    padding-left: constant(safe-area-inset-left);
    padding-top: env(safe-area-inset-top);
    padding-right: env(safe-area-inset-right);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
  }

  .v-btn.v-btn--floating.refresh-btn {
    position: absolute;
    bottom: 16px;
    right: 16px;
  }
</style>

<style scoped>
  .loading {
    z-index: 1000;
    position: fixed;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
  }
</style>
