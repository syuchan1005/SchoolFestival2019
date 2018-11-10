import { mixins, Line } from 'vue-chartjs';

export default {
  extends: Line,
  mixins: [mixins.reactiveProp],
  props: {
    chartData: {
      type: Object,
      default: null,
    },
    options: {
      type: Object,
      default: undefined,
    },
    width: {
      type: [Number, String],
      default: '90vw',
    },
    height: {
      type: [Number, String],
      default: '50vw',
    },
  },
  data() {
    return {
      colors: ['#e91e63', '#9c27b0', '#2196f3', '#009587', '#8bc34a', '#ffeb3b', '#ff9800', '#ff5722'],
    };
  },
  computed: {
    insertColorData() {
      return {
        ...this.chartData,
        datasets: this.chartData.datasets.map((v, i) => ({
          ...v,
          backgroundColor: this.colors[i],
          borderColor: this.colors[i],
          fill: false,
        })),
      };
    },
  },
  watch: {
    chartData() {
      // eslint-disable-next-line no-underscore-dangle
      this.$data._chart.update();
    },
  },
  mounted() {
    this.renderChart(this.insertColorData, this.options);
  },
};
