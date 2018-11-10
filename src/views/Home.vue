<template>
  <div class="home">
    <v-btn color="#00B900" dark large href="/line/auth" class="login-btn">
      <v-icon dark left>fab fa-line</v-icon>
      LINE Login
    </v-btn>

    <div class="alert">
      <v-alert v-model="showFailedAlert" type="error"
               dismissible transition="slide-y-reverse-transition">
        Login failed.
      </v-alert>
    </div>
  </div>
</template>

<script>
import qs from 'qs';

export default {
  name: 'Home',
  data() {
    return {
      showFailedAlert: false,
    };
  },
  mounted() {
    const query = qs.parse(window.location.search.substring(1));
    this.showFailedAlert = query.login === 'failed';
  },
};
</script>

<style scoped>
.home {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-btn {
  z-index: 1;
}

.alert {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
}
</style>
