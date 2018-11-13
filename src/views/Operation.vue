<template>
  <div class="operation">
    <v-card>
      <v-data-table
        :headers="[{ text: '', value: 'checkbox', align: 'left', sortable: false, width: '30px' },
         { text: '商品名', value: 'name' }, { text: '価格', value: 'price' }]"
        :items="products"
        hide-actions>
        <template slot="items" slot-scope="props">
          <td>
            <v-checkbox :input-value="props.item.id === selectedProductId"
                        @change="selectedProductId = props.item.id" primary hide-details/>
          </td>
          <td>{{ props.item.name }}</td>
          <td>{{ props.item.price }}</td>
        </template>
      </v-data-table>
    </v-card>

    <v-card class="forms">
      <v-text-field label="個数" v-model="amount" type="number" hide-details />
      <v-text-field label="食券" v-model="ticket" type="number" hide-details />
    </v-card>

    <v-card class="add-form">
      <div>合計: {{sumTotal}}円</div>
      <div class="sub">{{change >= 0 ? '不足' : 'お釣り'}}: {{Math.abs(change)}}円</div>
      <v-spacer />
      <v-btn class="primary" large @click="addOrder">追加</v-btn>
    </v-card>

    <v-btn fab dark class="refresh-btn green" @click="loadData">
      <v-icon>refresh</v-icon>
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'Operation',
  data() {
    return {
      products: [],
      selectedProductId: -1,
      amount: 2,
      ticket: 1,
    };
  },
  computed: {
    sumTotal() {
      const product = this.products.find(v => v.id === this.selectedProductId);
      return ((product && product.price) || 0) * this.amount;
    },
    change() {
      const price = this.sumTotal - this.ticket * 100;
      return price < 0 ? 0 : price;
    },
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      this.$store.commit('setLoading', { name: 'operation-team', value: true });
      this.$http({
        url: '/api/team',
      }).then((res) => {
        this.$store.commit('setLoading', { name: 'operation-team', value: false });
        this.products = res.data.products;
      }).catch((err) => {
        this.$store.commit('setLoading', { name: 'operation-team', value: false });
        if (err.response.status === 401) this.$router.push({ name: 'home', params: { state: 'failed' } });
        else if (err.response.status === 412) this.$router.push({ name: 'home', params: { state: 'no bot' } });
      });
    },
    addOrder() {
      this.$store.commit('setLoading', { name: 'operation-order', value: false });
      this.$http({
        method: 'post',
        url: '/team/order',
        data: {
          productId: this.selectedProductId,
          amount: this.amount,
          ticket: this.ticket,
        },
      }).then(() => {
        this.$store.commit('setLoading', { name: 'operation-order', value: false });
      }).catch((err) => {
        this.$store.commit('setLoading', { name: 'operation-order', value: false });
        if (err.response.status === 401) this.$router.push({ name: 'home', params: { state: 'failed' } });
        else if (err.response.status === 412) this.$router.push({ name: 'home', params: { state: 'no bot' } });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
  .operation {
    padding: 15px;
  }

  .forms {
    padding: 10px;
  }

  .add-form {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    padding: 0 20px;
    font-size: 45px;

    .sub {
      align-self: flex-end;
      font-size: 30px;
      color: gray;
    }

    .v-btn {
      width: 200px;
    }
  }

  .v-card + .v-card {
    margin-top: 30px;
  }
</style>
