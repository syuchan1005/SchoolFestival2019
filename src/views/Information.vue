<template>
  <div class="information">
    <div class="total">
      <div>個数: {{total.amount}}個</div>
      <div>金額: {{total.sum}}円</div>
      <div>食券: {{total.ticket}}枚</div>
    </div>

    <v-card style="padding: 10px">
      <v-card flat>
        <div class="toolbar-card">
          <v-menu
            :close-on-content-click="false"
            v-model="chartData.showDatePicker"
            :nudge-right="40" lazy
            transition="scale-transition"
            offset-y
            min-width="290px"
            class="date-picker"
          >
            <v-text-field
              slot="activator"
              v-model="chartData.date"
              label="日付"
              prepend-icon="event"
              readonly hide-details />
            <v-date-picker v-model="chartData.date" @input="chartData.showDatePicker = false"/>
          </v-menu>
          <div class="time">
            <v-select
              :items="chartData.time.slice(0, chartData.endTime)"
              v-model="chartData.startTime"
              label="Start Time"
              style="max-width: 80px"
              hide-details />
            <div class="suffix">:00</div>

            <div class="between">~</div>

            <v-select
              :items="chartData.time.slice(parseInt(chartData.startTime, 10) + 1)"
              v-model="chartData.endTime"
              label="End Time"
              style="max-width: 80px"
              hide-details />
            <div class="suffix">:00</div>
          </div>

          <v-spacer/>

          <v-select label="表示" v-model="showValue" class="value-selector" hide-details
                    :items="[{ text: '個数', value: 'amount'}, { text: '金額', value: 'subtotal'}]"/>
        </div>
      </v-card>
      <line-chart :chart-data="infoData" :options="infoOption"/>
    </v-card>

    <v-btn class="primary" @click="downloadCSV">
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
    infoOption() {
      return {
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
              labelString: this.showValue === 'amount' ? '販売個数' : '販売金額',
            },
            ticks: {
              min: 0,
            },
          }],
        },
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
    downloadCSV() {
      this.$http({
        url: '/api/csv',
      }).then((res) => {
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const blob = new Blob([bom, res.data], { type: 'text/csv' });
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
          window.navigator.msSaveBlob(blob, 'orders.csv');
        } else {
          const blobURL = window.URL.createObjectURL(blob);
          const tempLink = document.createElement('a');
          tempLink.style.display = 'none';
          tempLink.href = blobURL;
          tempLink.setAttribute('download', 'orders.csv');

          if (typeof tempLink.download === 'undefined') {
            tempLink.setAttribute('target', '_blank');
          }

          document.body.appendChild(tempLink);
          tempLink.click();
          document.body.removeChild(tempLink);
          window.URL.revokeObjectURL(blobURL);
        }
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

  .toolbar-card {
    padding: 0 10px 5px 10px;
    display: flex;

    .date-picker {
      max-width: 130px;
      margin-right: 10px;
    }

    .time {
      display: flex;

      .suffix {
        font-size: 16px;
        align-self: flex-end;
      }

      .between {
        font-size: 16px;
        align-self: flex-end;
        padding: 0 5px;
      }
    }

    .value-selector {
      max-width: 100px;
    }
  }
</style>
