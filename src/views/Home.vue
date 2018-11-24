<template>
  <div class="home">
    <v-btn-toggle class="calendar-toggle" v-model="type">
      <v-btn flat value="all">
        全体予定
      </v-btn>
      <v-btn value="shift">
        シフト
      </v-btn>
    </v-btn-toggle>

    <v-card v-if="type === 'all'">
      <div style="display: flex">
        <v-spacer />
        <v-btn outline color="primary" @click="expandAll(true)">Expand</v-btn>
        <v-btn outline color="error"  @click="expandAll(false)">Collapse</v-btn>
      </div>
      <v-flex xs12 lg5 mb-3>
        <v-expansion-panel expand v-model="panelOpen">
          <v-expansion-panel-content v-for="panel in panels" :key="panel.title">
            <div slot="header">
              <div>{{ panel.title }}</div>
              <div>{{ panel.expiredAt }}まで</div>
            </div>
            <v-card>
              <v-card-text>
                <vue-markdown>{{ panel.body }}</vue-markdown>
              </v-card-text>
            </v-card>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-flex>
    </v-card>

    <v-data-table :headers="shiftHeader" :items="shiftItem" hide-actions
                  class="elevation-1" v-else-if="type === 'shift'">
      <template slot="items" slot-scope="props">
        <td v-for="text in props.item" :key="text">
          {{ text }}
        </td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import VueMarkdown from 'vue-markdown';

export default {
  components: {
    VueMarkdown,
  },
  name: 'Home',
  title: 'Home - School Festival 2019',
  data() {
    return {
      type: 'all',
      panelOpen: [],
      panels: [{
        title: 'AAA',
        body: '# AAA\n## Summary\nABCDEFG',
        expiredAt: '2018/11/23 19:00:00',
      }],
      shift: {
        rules: ['会計', '調理', '呼込', '受付'],
        times: [
          {
            startTime: '09:00',
            endTime: '10:00',
            rule: [
              ['00001'],
              ['00002'],
              ['00003'],
              ['00004'],
            ],
          },
        ],
      },
    };
  },
  computed: {
    shiftHeader() {
      return [
        { text: '時間', sortable: false },
        ...this.shift.times.map(v => ({
          text: `${v.startTime}-${v.endTime}`,
          sortable: false,
        })),
      ];
    },
    shiftItem() {
      return this.shift.rules.map((v, i) => [v, ...this.shift.times.map(r => r.rule[i].join(', '))]);
    },
  },
  methods: {
    expandAll(val) {
      if (val) {
        this.panelOpen = this.panels.map(() => true);
      } else {
        this.panelOpen = [];
      }
    },
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
