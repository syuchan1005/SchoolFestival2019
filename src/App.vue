<template>
  <v-app>
    <v-toolbar class="green header-bar" dark v-if="$route.path === '/info'">
      <v-toolbar-title>School Festival 2019</v-toolbar-title>
      <v-spacer/>
      <v-btn class="blue darken-1" href="/line/logout">logout</v-btn>
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

  .header-bar {
    z-index: 1;
  }
</style>
