<template>
  <div class="home">
    <v-btn-toggle class="calendar-toggle" v-model="type">
      <v-btn flat value="all">
        全体日程
      </v-btn>
      <v-btn value="shift">
        シフト
      </v-btn>
    </v-btn-toggle>

    <v-card>
      ここにタイムラインが入る予定だけどいい感じのがないから保留
    </v-card>

    <v-card>
      タイムラインの予定クリックで文言とかファイルとかでるところ
    </v-card>
  </div>
</template>

<script>

export default {
  name: 'Home',
  title: 'Home - School Festival 2019',
  data() {
    return {
      type: 'all',
    };
  },
};
</script>

<style lang="scss" scoped>
  .home {
    padding: 10px;
  }

  .calendar-toggle {
    margin: 10px;
  }

  .v-card + .v-card {
    margin-top: 10px;
  }
</style>
