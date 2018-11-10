<template>
  <div class="information">
    <div class="total">
      <div>個数: {{total.amount}}個</div>
      <div>金額: {{total.sum}}円</div>
      <div>食券: {{total.ticket}}枚</div>
    </div>

    <div class="chart-input">
      <v-menu
        :close-on-content-click="false"
        v-model="chartData.showDatePicker"
        :nudge-right="40"
        lazy
        transition="scale-transition"
        offset-y
        full-width
        min-width="290px"
      >
        <v-text-field
          slot="activator"
          v-model="chartData.date"
          label="日付"
          prepend-icon="event"
          readonly
        ></v-text-field>
        <v-date-picker v-model="chartData.date" @input="chartData.showDatePicker = false"/>
      </v-menu>

      <v-spacer/>

      <div class="time">
        <v-select
          :items="chartData.time.slice(0, chartData.endTime)"
          v-model="chartData.startTime"
          label="Start Time"
          style="max-width: 80px"
        ></v-select>
        <div class="suffix">:00</div>

        <div class="between">~</div>

        <v-select
          :items="chartData.time.slice(parseInt(chartData.startTime, 10) + 1)"
          v-model="chartData.endTime"
          label="End Time"
          style="max-width: 80px"
        ></v-select>
        <div class="suffix">:00</div>
      </div>
    </div>

    <div class="chart-value">
      <v-select label="表示" v-model="showValue"
                :items="[{ text: '個数', value: 'amount'}, { text: '金額', value: 'subtotal'}]"/>
    </div>

    <line-chart :chart-data="infoData" :options="infoOption"/>

    <v-btn class="primary">
      <v-icon left>fa-download</v-icon>
      Download csv
    </v-btn>

    <v-btn fab dark class="refresh-btn green" @click="loadData">
      <v-icon>refresh</v-icon>
    </v-btn>
  </div>
</template>

<script>
import LineChart from '../components/LineChart';

export default {
  name: 'Information',
  title: 'School Festival 2019 (Information)',
  components: { LineChart },
  data() {
    return {
      infoOption: {
        animation: false,
        responsive: true,
        tooltips: {
          mode: 'index',
          intersect: false,
        },
        hover: {
          mode: 'nearest',
          intersect: true,
        },
        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: '時間',
            },
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: '販売個数',
            },
            ticks: {
              min: 0,
            },
          }],
        },
      },
      total: {
        amount: 0,
        sum: 0,
        ticket: 0,
      },
      info: [],
      showValue: 'amount',
      chartData: {
        showDatePicker: false,
        date: new Date().toISOString().substr(0, 10),
        time: [...Array(24).keys()].map(v => `0${v}`.slice(-2)),
        startTime: '00',
        endTime: '23',
      },
    };
  },
  computed: {
    chartLabel() {
      const start = parseInt(this.chartData.startTime, 10);
      const end = parseInt(this.chartData.endTime, 10);
      return [...Array(end - start + 1).keys()].map(v => `${`0${v + start}`.slice(-2)}:00`);
    },
    infoData() {
      return {
        labels: this.chartLabel,
        datasets: this.info.map(v => ({
          label: v.name,
          data: this.chartLabel
            .map(label => (v.time[label] && v.time[label][this.showValue]) || 0),
        })),
      };
    },
  },
  watch: {
    chartData: {
      deep: true,
      handler() {
        this.loadInfo();
      },
    },
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      this.loadTotal();
      this.loadInfo();
    },
    loadTotal() {
      this.$http({
        url: '/api/total',
      }).then((res) => {
        this.total = res.data;
      }).catch((err) => {
        if (err.response.status === 401) this.$router.push('/');
      });
    },
    loadInfo() {
      this.$http({
        url: '/api/info',
        params: {
          date: this.chartData.date,
          startTime: `${this.chartData.startTime}:00`,
          endTime: `${this.chartData.endTime}:00`,
        },
      }).then((res) => {
        this.info = res.data;
      }).catch((err) => {
        if (err.response.status === 401) this.$router.push('/');
      });
    },
  },
};
</script>

<style lang="scss" scoped>
  .information {
    padding: 10px;
  }

  .total {
    display: flex;
    flex-wrap: wrap;
    font-size: 2rem;

    * {
      padding: 0 10px;
    }
  }

  .refresh-btn {
    position: absolute;
    bottom: 16px;
    right: 16px;
  }

  .chart-input {
    display: flex;
    flex-wrap: wrap;

    .time {
      display: flex;

      .suffix {
        font-size: 16px;
        align-self: flex-end;
        margin-bottom: 24px;
      }

      .between {
        font-size: 16px;
        align-self: flex-end;
        margin-bottom: 24px;
        padding: 0 5px;
      }
    }
  }

  .chart-value {
    display: flex;
    justify-content: flex-end;

    * {
      max-width: 100px;
    }
  }
</style>
