<template>
  <div class="setting">
    <v-card class="teamname-field">
      <v-text-field label="団体名" v-model="teamNameModel" hide-details/>
      <v-btn class="primary save-btn" @click="() => {
        if (this.teamNameModel.length !== 0) this.showChangeDialog = true;
      }">Save</v-btn>
    </v-card>

    <v-card>
      <div class="overlay" v-if="teamName !== teamNameModel">
        <div>団体名が変更されているため編集できません</div>
      </div>
      <v-card-title>
        商品
        <v-spacer></v-spacer>
        <v-btn icon @click="showAddDialog = true">
          <v-icon>add</v-icon>
        </v-btn>
      </v-card-title>
      <v-data-table
        :headers="headers"
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

    <v-dialog v-model="showAddDialog" persistent max-width="300px">
      <v-card>
        <v-card-title>商品追加</v-card-title>
        <v-card-text>
          <v-text-field label="商品名" v-model="addProductItem.name" required/>
          <v-text-field type="number" label="価格" v-model="addProductItem.price" required/>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click.native="showAddDialog = false">キャンセル</v-btn>
          <v-btn color="green darken-1" flat
                 @click.native="() => { addProduct(); showAddDialog = false; }">
            追加する
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showDeleteDialog" persistent max-width="250px">
      <v-card>
        <v-card-title>削除しますか?</v-card-title>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="blue darken-1" flat @click="showDeleteDialog = false">削除しない</v-btn>

          <v-btn color="green darken-1" flat @click="showDeleteDialog = false">削除する</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showChangeDialog" persistent max-width="250px">
      <v-card>
        <v-card-title>団体名を{{teamNameModel}}に変更しますか?</v-card-title>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="blue darken-1" flat @click="showChangeDialog = false">変更しない</v-btn>

          <v-btn color="green darken-1" flat
                 @click="() => { changeTeamName(); this.showChangeDialog = false; }">変更する</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'Setting',
  data() {
    return {
      teamName: '',
      teamNameModel: '',
      headers: [
        { text: '商品名', value: 'name' },
        { text: '価格', value: 'price' },
        {
          text: '',
          value: 'delete',
          align: 'right',
          sortable: false,
          width: '30px',
        },
      ],
      products: [],
      showAddDialog: false,
      addProductItem: {
        name: '',
        price: 0,
      },
      showDeleteDialog: false,
      deleteProductId: -1,
      showChangeDialog: false,
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      this.$http({
        url: '/api/team',
      }).then((res) => {
        this.teamName = res.data.name;
        this.teamNameModel = res.data.name;
        this.products = res.data.products;
      });
    },
    changeTeamName() {
      this.$http({
        method: 'post',
        url: '/api/team/name',
        data: {
          name: this.teamNameModel,
        },
      }).then(() => {
        this.loadData();
      }).catch((err) => {
        if (err.response.status === 401) this.$router.push({ name: 'home', params: { state: 'failed' } });
        else if (err.response.status === 412) this.$router.push({ name: 'home', params: { state: 'no bot' } });
      });
    },
    addProduct() {
      if (this.addProductItem.name.length === 0 || this.addProductItem.price.length === 0) return;
      this.$http({
        method: 'post',
        url: '/api/team/product',
        data: this.addProductItem,
      }).then(() => {
        this.loadData();
      }).catch((err) => {
        if (err.response.status === 401) this.$router.push({ name: 'home', params: { state: 'failed' } });
        else if (err.response.status === 412) this.$router.push({ name: 'home', params: { state: 'no bot' } });
      });
    },
    deleteProduct() {
      this.$http({
        method: 'post',
        url: `/api/team/product/${this.deleteProductId}`,
      }).then(() => {
        this.loadData();
      }).catch((err) => {
        if (err.response.status === 401) this.$router.push({ name: 'home', params: { state: 'failed' } });
        else if (err.response.status === 412) this.$router.push({ name: 'home', params: { state: 'no bot' } });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
  .setting {
    padding: 10px;

    .teamname-field {
      display: flex;
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
