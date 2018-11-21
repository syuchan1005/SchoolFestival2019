<template>
  <div class="home">
    <v-card v-if="pwa" class="mx-auto" max-width="500" width="90vw">
      <v-card-title class="title font-weight-regular justify-space-between">
        <span>SchoolFestival 2019</span>
      </v-card-title>
      <v-card-text>
        <div>WebからTokenを取得して入力してください</div>
        <v-form ref="token">
          <v-text-field label="Token" v-model="token" :disabled="tokenLoading"
                        required :rules="[v => v.length > 0 || '入力必須です']"/>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn class="primary" @click="authToken" :disabled="tokenLoading">
          ログイン
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-card v-else class="mx-auto" max-width="500" width="90vw">
      <v-card-title class="title font-weight-regular justify-space-between">
        <span>SchoolFestival 2019</span>
      </v-card-title>

      <v-window v-model="step">
        <v-window-item :value="1">
          <v-card-text class="window-1">
            <v-btn class="primary" depressed large block href="/line/auth">
              ログイン
            </v-btn>
            <v-btn color="green lighten-1" dark depressed large block @click="step++">
              新規登録
            </v-btn>
          </v-card-text>
        </v-window-item>

        <v-window-item :value="2">
          <v-card-text>
            <v-form ref="input">
              <v-text-field label="学籍番号" prefix="s" mask="#####"
                            v-model="studentNumber"
                            :rules="[v => v.length === 5 || '5桁の学籍番号を入力してください']"/>
              <v-combobox chips clearable multiple
                          label="参加団体" :items="teams" v-model="joinedTeams"
                          :rules="[v => v.length !== 0 || '最低一団体を選択する必要があります']">
                <template slot="selection" slot-scope="data">
                  <v-chip close :selected="data.selected" @input="removeChip(data)">
                    <strong>{{ data.item }}</strong>
                  </v-chip>
                </template>
              </v-combobox>
            </v-form>
          </v-card-text>
        </v-window-item>

        <v-window-item :value="3">
          <v-card-text>
            <span>LINE Botを追加して以下の四桁の数字を送信してください</span>
            <v-card max-width="135" style="margin: 10px auto" v-if="!reloadRegistrationCode">
              <v-card-text class="display-2">
                {{ registrationCode }}
              </v-card-text>
            </v-card>
            <div v-else style="display:flex;justify-content:center" @click="nextStep(0)">
              <v-btn class="primary" large style="margin: 10px">
                コードを取得する
              </v-btn>
            </div>
            <v-btn color="#00c300" dark large block @click="openBotURL">
              <v-icon left>fab fa-line</v-icon>
              Botを追加する (別のタブが開きます)
            </v-btn>
          </v-card-text>
        </v-window-item>
      </v-window>

      <v-divider></v-divider>
      <v-card-actions v-if="step !== 1">
        <v-btn flat @click="step--">Back</v-btn>
        <v-spacer></v-spacer>
        <v-btn v-if="step === 2" color="primary" depressed @click="nextStep(1)">Next</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import qs from 'qs';

export default {
  name: 'Top',
  title: 'School Festival 2019',
  data: () => ({
    step: 1,
    studentNumber: '',
    joinedTeams: [],
    teams: ['TestA', 'TestB'],
    registrationCode: '',
    reloadRegistrationCode: false,
    iframeUrl: undefined,

    token: '',
    tokenLoading: false,
  }),
  computed: {
    pwa: {
      get() {
        return this.$store.state.isPWA;
      },
      set(val) {
        this.$store.commit('setPWA', val);
      },
    },
  },
  mounted() {
    const query = qs.parse(window.location.search.substring(1));
    this.pwa = query.launcher === 'true';
    if (this.pwa) {
      this.loginToken();
    }
  },
  methods: {
    removeChip(chip) {
      this.joinedTeams.splice(this.joinedTeams.indexOf(chip), 1);
      this.joinedTeams = [...this.joinedTeams];
    },
    async nextStep(stepCount = 1) {
      if (this.$refs.input.validate()) {
        this.step += stepCount;
        this.reloadRegistrationCode = false;
        this.$store.commit('setLoading', { name: 'top-registration', value: true });
        try {
          const res = await this.$http({
            method: 'POST',
            url: '/registration',
            data: {
              studentNumber: this.studentNumber,
              teams: this.joinedTeams,
            },
          });

          this.$store.commit('setLoading', { name: 'top-registration', value: false });
          this.registrationCode = res.data;
        } catch (e) {
          this.$store.commit('setLoading', { name: 'top-registration', value: false });
        }
        this.$http({
          url: '/registration/wait',
        }).then(() => {
          this.$router.push('/home');
        }).catch(() => {
          this.reloadRegistrationCode = true;
        });
      }
    },
    openBotURL() {
      window.open(process.env.VUE_APP_BOT_URL);
    },
    authToken() {
      this.tokenLoading = true;
      if (!this.$refs.token.validate()) return;
      this.$http({
        method: 'post',
        url: '/token/auth',
        data: {
          token: this.token,
        },
      }).then((res) => {
        localStorage.setItem('tempToken', this.token);
        localStorage.setItem('token', res.data);
        this.loginToken();
        this.tokenLoading = false;
      }).catch(() => {
        this.tokenLoading = false;
      });
    },
    loginToken() {
      const tempToken = localStorage.getItem('tempToken');
      const token = localStorage.getItem('token');
      if (tempToken && token) {
        this.$http({
          method: 'post',
          url: '/token/login',
          data: { tempToken, token },
        }).then(() => {
          this.$router.push('/home');
        }).catch(/* ignored */);
      }
    },
  },
};
</script>

<style>
  .login-btn .v-btn__content {
    flex-direction: column !important;
    font-size: 1.5rem;
  }
</style>

<style lang="scss" scoped>
  .home {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .v-card__text > .v-btn {
      margin: 10px 0;
  }
</style>
