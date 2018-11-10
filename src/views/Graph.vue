<template>
  <div class="graph">
    <line-chart :chart-data="sample" :options="sampleOption" />
    <v-btn class="primary">
      <v-icon left>fa-download</v-icon>
      Download csv
    </v-btn>
  </div>
</template>

<script>
import LineChart from '../components/LineChart';

export default {
  name: 'Graph',
  components: { LineChart },
  data() {
    return {
      sample: {
        labels: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
        datasets: [
          { label: '商品A', data: [100, 100, 50, 20] },
          { label: '商品B', data: [100, 50, 20, 20] },
          { label: '商品A', data: [100, 100, 50, 20] },
          { label: '商品B', data: [100, 50, 20, 20] },
          { label: '商品A', data: [100, 100, 50, 20] },
          { label: '商品B', data: [100, 50, 20, 20] },
          { label: '商品A', data: [100, 100, 50, 20] },
          { label: '商品B', data: [100, 50, 20, 20] },
        ],
      },
      sampleOption: {
        animation: false,
        responsive: true,
        title: {
          display: true,
          text: '販売個数',
        },
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
          }],
        },
      },
    };
  },
};
</script>

<style scoped>
  .graph {
    padding: 10px;
  }
</style>
