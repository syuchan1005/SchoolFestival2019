<template>
  <v-app>
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
export default {
  name: 'App',
  data() {
    return {
      pages: ['info', 'setting'],
    };
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
</style>
