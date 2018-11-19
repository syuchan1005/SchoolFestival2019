<template>
  <div class="setting">
    <v-card class="teamname-field">
      <v-combobox ref="joinTeamForm" chips clearable multiple
                  label="参加団体" :items="teams" v-model="joinedTeamsModel"
                  :rules="[v => v.length !== 0 || '最低一団体を選択する必要があります']">
        <template slot="selection" slot-scope="data">
          <v-chip close :selected="data.selected" @input="removeChip(data)">
            <strong>{{ data.item }}</strong>
          </v-chip>
        </template>
      </v-combobox>
      <v-btn class="primary save-btn" @click="() => {
        if ($refs.joinTeamForm.validate()) this.showChangeDialog = true;
      }">Save
      </v-btn>
    </v-card>

    <v-card>
      <v-card-title>
        商品
        <v-spacer></v-spacer>
        <v-select v-model="selectProductTeamId" :items="joinedTeams"
                  label="団体" item-text="name" item-value="id"
                  :disabled="joinedTeams.length === 1" hide-details box
                  style="max-width: 200px;width: 200px"/>
        <v-btn icon @click="showAddDialog = true">
          <v-icon>add</v-icon>
        </v-btn>
      </v-card-title>
      <v-data-table
        :headers="[{ text: '商品名', value: 'name' }, { text: '価格', value: 'price' },
         { text: '', value: 'delete', align: 'right', sortable: false, width: '30px' }]"
        :items="products"
        hide-actions
      >
        <template slot="items" slot-scope="props">
          <td>{{ props.item.name }}</td>
          <td>{{ props.item.price }}</td>
          <td>
            <v-icon @click="() => { showDeleteDialog = true; deleteProductId = props.item.id }">
              delete
            </v-icon>
          </td>
        </template>
      </v-data-table>
    </v-card>

    <v-btn fab dark class="refresh-btn green" @click="$apollo.queries.data.refetch()">
      <v-icon>refresh</v-icon>
    </v-btn>

    <v-dialog v-model="showAddDialog" persistent max-width="300px">
      <v-card>
        <v-card-title>商品追加</v-card-title>
        <v-card-text>
          <v-text-field label="商品名" v-model="addProductItem.name" required/>
          <v-text-field type="number" label="価格" v-model="addProductItem.price" required/>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <apollo-mutation :mutation="addProductMutation" :variables="{ teamId: $store.state.teamId,
                           name: addProductItem.name, price: parseInt(addProductItem.price, 10) }"
                           @done="() => {
                             this.showAddDialog = false;
                             this.$apollo.queries.products.refetch();
                           }">
            <template slot-scope="{ mutate, loading }">
              <v-btn color="blue darken-1" flat @click.native="showAddDialog = false">キャンセル</v-btn>
              <v-btn color="green darken-1" flat :disabled="loading" @click.native="mutate()">
                追加する
              </v-btn>
            </template>
          </apollo-mutation>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showDeleteDialog" persistent max-width="250px">
      <v-card>
        <v-card-title>削除しますか?</v-card-title>

        <v-card-actions>
          <v-spacer></v-spacer>
          <apollo-mutation :mutation="deleteProductMutation"
                           :variables="{ productId: deleteProductId }"
                           @done="() => {
                             this.showDeleteDialog = false;
                             this.$apollo.queries.products.refetch();
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

    <v-dialog v-model="showChangeDialog" persistent max-width="250px">
      <v-card>
        <v-card-title>参加団体を{{joinedTeamsModel.join(' ,')}}に変更しますか?</v-card-title>

        <v-card-actions>
          <v-spacer></v-spacer>
          <apollo-mutation :mutation="updateTeamMutation" :variables="{ teams: joinedTeamsModel }"
                           @done="() => {
                             this.showChangeDialog = false;
                             this.$apollo.queries.data.refetch();
                           }">
            <template slot-scope="{ mutate, loading }">
              <v-btn color="blue darken-1" flat :disabled="loading"
                     @click="showChangeDialog = false">変更しない
              </v-btn>
              <v-btn color="green darken-1" flat :disabled="loading" @click="mutate()">
                変更する
              </v-btn>
            </template>
          </apollo-mutation>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import gql from 'graphql-tag';

export default {
  name: 'Setting',
  apollo: {
    products: {
      query: gql`query Products($teamId: Int!) {
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
          teamId: this.selectProductTeamId,
        };
      },
      skip() {
        return this.selectProductTeamId === -1;
      },
      manual: true,
      result({ data }) {
        this.products = data.team.products;
      },
    },
    data: {
      query: gql`{user{teams{id name}}teams{name}}`,
      manual: true,
      result({ data }) {
        this.joinedTeams = data.user.teams;
        this.joinedTeamsModel = this.joinedTeams.map(v => v.name);
        this.teams = data.teams.map(v => v.name);
        if (this.joinedTeams.length >= 1) {
          this.selectProductTeamId = this.joinedTeams[0].id;
        }
      },
    },
  },
  data() {
    return {
      showAddDialog: false,
      addProductItem: {
        name: '',
        price: 0,
      },
      showDeleteDialog: false,
      showChangeDialog: false,
      deleteProductId: -1,

      joinedTeams: [],
      joinedTeamsModel: [],
      teams: [],
      selectProductTeamId: -1,
      products: [],
      updateTeamMutation: gql`mutation UpdateTeam($teams: [String!]!){
        updateUserTeams(teams: $teams) { id }
      }`,
      addProductMutation: gql`mutation AddProduct($teamId: Int!, $name: String!, $price: Int!){
        addProduct(teamId: $teamId, name: $name, price: $price) { id }
      }`,
      deleteProductMutation: gql`mutation DeleteProduct($productId: Int!) {
        deleteProduct(productId: $productId) { success }
      }`,
    };
  },
  methods: {
    removeChip(chip) {
      this.joinedTeamsModel.splice(this.joinedTeamsModel.indexOf(chip), 1);
      this.joinedTeamsModel = [...this.joinedTeamsModel];
    },
  },
};
</script>

<style lang="scss" scoped>
  .setting {
    padding: 10px;
    padding-bottom: 150px;

    .teamname-field {
      display: flex;
      align-items: center;
      padding: 10px;

      .save-btn {
        margin-left: 20px;
      }
    }

    .v-card + .v-card {
      margin-top: 20px;
    }

    .overlay {
      z-index: 1;
      position: absolute;
      width: 100%;
      height: 100%;
      font-size: 2rem;
      color: white;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
</style>
