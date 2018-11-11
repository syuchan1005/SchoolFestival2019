<template>
  <div class="home">
    <v-btn color="#00B900" dark large href="/line/auth" class="login-btn">
      <v-icon dark left>fab fa-line</v-icon>
      LINE Login
    </v-btn>
    <v-btn color="#0068b9" dark large :href="botURL" class="login-btn">
      <v-icon dark left>fab fa-line</v-icon>
      Add LineBot
    </v-btn>

    <div class="alert">
      <v-alert v-model="showFailedAlert" type="error" dismissible>
        {{ failedMessage }}
      </v-alert>
    </div>
  </div>
</template>

<script>
import qs from 'qs';

export default {
  name: 'Home',
  title: 'School Festival 2019',
  data() {
    return {
      failedMessage: '',
      showFailedAlert: false,
      botURL: process.env.VUE_APP_BOT_URL,
    };
  },
  mounted() {
    const query = qs.parse(window.location.search.substring(1));
    if (!query.state) {
      this.$http({
        url: '/api',
      }).then((res) => {
        if (res.status === 200) this.$router.push('/info');
      }).catch((err) => {
        if (err.response.status === 412) {
          this.failedMessage = 'Botから設定が必要です';
          this.showFailedAlert = true;
        }
      });
    } else if (query.state === 'failed') {
      this.failedMessage = 'ログインに失敗しました';
      this.showFailedAlert = true;
    } else if (query.state === 'no bot') {
      this.failedMessage = 'Botから設定が必要です';
      this.showFailedAlert = true;
    }
  },
};
</script>

<style scoped>
.home {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.v-btn {
  margin: 10px;
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
