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
      <v-text-field label="個数" v-model="amount" type="number" hide-details/>
      <v-text-field label="食券" v-model="ticket" type="number" hide-details/>
    </v-card>

    <v-card class="add-form">
      <div>合計: {{sumTotal}}円</div>
      <div class="sub">{{change >= 0 ? '不足' : 'お釣り'}}: {{Math.abs(change)}}円</div>
      <v-spacer/>
      <apollo-mutation :mutation="addOrderMutation"
                       :variables="{
                         productId: parseInt(this.selectedProductId, 10),
                         amount: parseInt(amount, 10),
                         ticket: parseInt(ticket, 10),
                       }" @done="$apollo.queries.order.refetch()">
        <template slot-scope="{ mutate, loading }">
          <v-btn class="primary" large :disabled="loading" @click="mutate()">追加</v-btn>
        </template>
      </apollo-mutation>
    </v-card>

    <v-card>
      <v-data-table
        :headers="[{ sortable: false, text: '商品名', value: 'name' },
         { sortable: false, text: '価格', value: 'price' },
         { sortable: false, text: '個数', value: 'amount' },
         { sortable: false, text: '食券', value: 'ticket' },
         { sortable: false, text: '追加日時', value: 'createAt' },
         { text: '', value: 'delete', align: 'right', sortable: false, width: '30px' }]"
        :items="order.orders" hide-actions>
        <template slot="items" slot-scope="props">
          <td>{{ order.products.find(p => p.id === props.item.productId).name }}</td>
          <td>{{ order.products.find(p => p.id === props.item.productId).price }}</td>
          <td>{{ props.item.amount }}</td>
          <td>{{ props.item.ticket }}</td>
          <td>{{ props.item.createdAt }}</td>
          <td>
            <v-icon @click="() => { showDeleteDialog = true; deleteOrderId = props.item.id; }">
              delete
            </v-icon>
          </td>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="showDeleteDialog" persistent max-width="250px">
      <v-card>
        <v-card-title>削除しますか?</v-card-title>

        <v-card-actions>
          <v-spacer></v-spacer>
          <apollo-mutation :mutation="deleteOrderMutation"
                           :variables="{ orderId: parseInt(deleteOrderId, 10) }"
                           @done="() => {
                             this.showDeleteDialog = false;
                             this.$apollo.queries.order.refetch();
                           }">
            <template slot-scope="{ mutate, loading }">
              <v-btn color="blue darken-1" flat :disabled="loading"
                     @click="showDeleteDialog = false">削除しない
              </v-btn>

              <v-btn color="green darken-1" flat :disabled="loading"
                     @click="mutate()">削除する
              </v-btn>
            </template>
          </apollo-mutation>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-btn fab dark class="refetch-btn green" @click="$apollo.queries.products.refetch()">
      <v-icon>refresh</v-icon>
    </v-btn>
  </div>
</template>

<script>
import gql from 'graphql-tag';

export default {
  name: 'Operation',
  title: 'Operation - School Festival 2019',
  apollo: {
    products: {
      query: gql`query Products($teamId: Int!){
        team(teamId: $teamId) {
          products {
            id
            name
            price
          }
        }
      }`,
      variables() {
        return {
          teamId: this.$store.state.teamId,
        };
      },
      manual: true,
      result({ data }) {
        this.products = data.team.products;
        if (this.products.length >= 1) {
          this.selectedProductId = this.products[0].id;
        }
      },
    },
    order: {
      query: gql`query Orders($teamId: Int!) {
        team(teamId: $teamId) {
          order {
            products {id name price deletedAt}
            orders { id amount ticket productId createdAt }
          }
        }
      }`,
      variables() {
        return {
          teamId: this.$store.state.teamId,
        };
      },
      manual: true,
      result({ data }) {
        this.order = data.team.order;
      },
    },
  },
  data() {
    return {
      order: {},
      deleteOrderId: -1,
      showDeleteDialog: false,
      products: [],
      selectedProductId: -1,
      amount: 1,
      ticket: 0,
      addOrderMutation: gql`mutation AddOrder($productId: Int!,$amount: Int!,$ticket: Int!){
        addOrder(productId: $productId, amount: $amount, ticket: $ticket) { id }
      }`,
      deleteOrderMutation: gql`mutation DeleteOrder($orderId: Int!){
        deleteOrder(orderId: $orderId) {
          success
        }
      }`,
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
};
</script>

<style lang="scss" scoped>
  .operation {
    padding: 15px 15px 70px;
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
