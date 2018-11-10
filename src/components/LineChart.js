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
      const data = this.chartData;
      return {
        ...data,
        datasets: data.datasets.map((v, i) => ({
          backgroundColor: this.colors[i],
          borderColor: this.colors[i],
          fill: false,
          ...v,
        })),
      };
    },
  },
  watch: {
    chartData() {
      // eslint-disable-next-line no-underscore-dangle
      this.$data._chart.destroy();
      this.reRender();
    },
    options() {
      // eslint-disable-next-line no-underscore-dangle
      this.$data._chart.destroy();
      this.reRender();
    },
  },
  mounted() {
    this.reRender();
  },
  methods: {
    reRender() {
      this.renderChart(this.insertColorData, this.options);
    },
  },
};
