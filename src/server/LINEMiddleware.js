import moment from 'moment';

import Config from '../../config';
import LINE from './LINE';
import Database from './Database';

const actions = {
  addOrder: {
    keyword: '注文を追加',
    state: {
      async askProduct(ctx, builder, event) {
        const productId = parseInt(event.message.text.trim().match(/ID:\s*(\d+)\s*を選択/)[1], 10);
        ctx.$session.product = await Database.findProduct(productId);
        ctx.$session.state = 'askAmount';
        builder
          .addTextMessage('個数を教えてください')
          .addKeyPadWithCancel();
      },
      async askAmount(ctx, builder, event) {
        const amount = parseInt(event.message.text, 10);
        if (!Number.isInteger(amount)) {
          builder
            .addTextMessage('数字ではないか大きすぎます.\nもう一度入力してください');
        } else {
          ctx.$session.amount = amount;
          ctx.$session.state = 'askTicket';
          builder
            .addTextMessage('食券は何枚ありますか?')
            .addKeyPadWithZero();
        }
      },
      async askTicket(ctx, builder, event) {
        const ticket = parseInt(event.message.text, 10);
        if (!Number.isInteger(ticket)) {
          builder
            .addTextMessage('数字ではないか大きすぎます.\nもう一度入力してください');
        } else {
          ctx.$session.ticket = ticket;
          ctx.$session.state = 'confirmAdd';
          builder
            .addConfirm(`商品: ${ctx.$session.product.get('name')} (${ctx.$session.product.get('price')}円)\n個数: ${ctx.$session.amount}個\nを追加しますか?`,
              '追加する', '追加しない');
        }
      },
      async confirmAdd(ctx, builder, event, middleware) {
        if (event.message.text.trim() === '追加する') {
          await Database.addOrder(ctx.$session.product.get('id'), ctx.$session.amount, ctx.$session.ticket);
          builder.addTextMessage('追加しました.');
        } else {
          builder.addTextMessage('追加をキャンセルしました.');
        }
        middleware.deleteSession(ctx);
        builder.addTextMessage('何をしますか?')
          .addRichMenu();
      },
      selectTeam: {
        patterns: [
          {
            name: 'teamId',
            pattern: /(?<teamId>\d+)/,
            async handler(ctx, builder, event, middleware, { teamId }) {
              ctx.$session.teamId = teamId;
              const products = await Database.findProducts(ctx.$session.teamId);
              if (products.length === 0) {
                builder.addTextMessage('商品がありません. 商品一覧から追加してください.');
                middleware.deleteSession(ctx);
              } else if (products.length === 1) {
                const product = products[0];
                ctx.$session.state = 'askAmount';
                ctx.$session.product = product;
                builder
                  .addTextMessage('どの商品を追加しますか?')
                  .addTextMessage(`> ${product.get('name')} (${product.get('price')}円) ID: ${product.get('id')}`)
                  .addTextMessage('個数を教えてください')
                  .addKeyPadWithCancel();
              } else {
                ctx.$session.state = 'askProduct';
                builder
                  .addTextMessage('どの商品を追加しますか?')
                  .addProductCarousel(products, false, false, true);
              }
            },
          },
        ],
        async handler(ctx, builder) {
          builder.addTextMessage('数字ではないか、大きすぎます。\nもう一度入力してください。');
        },
      },
      async default(ctx, builder) {
        const teams = await ctx.$user.getTeams();
        if (teams.length !== 1) {
          builder.addTextMessage('団体を選択してください').addTeamCarousel(teams);
        } else {
          builder.addTextMessage(`> ID: ${teams[0].id} (${teams[0].name})`);
          return ['selectTeam', 'teamId', { teamId: teams[0].id }];
        }
        return undefined;
      },
    },
  },
  deleteLastOrder: {
    keyword: '最後の注文を削除',
    state: {
      async confirmDelete(ctx, builder, event, middleware) {
        if (event.message.text.trim() === '削除する') {
          await Database.deleteOrder(ctx.$session.order.get('id'), ctx.$session.teamId);
          builder.addTextMessage('削除しました');
        } else {
          builder.addTextMessage('キャンセルしました');
        }
        middleware.deleteSession(ctx);
        builder.addTextMessage('何をしますか?')
          .addRichMenu();
      },
      selectTeam: {
        patterns: [
          {
            name: 'teamId',
            pattern: /(?<teamId>\d+)/,
            async handler(ctx, builder, event, middleware, { teamId }) {
              ctx.$session.teamId = teamId;
              ctx.$session.state = 'confirmDelete';
              const latestOrder = await Database.findLatestOrder(ctx.$session.teamId);
              if (latestOrder === null) {
                builder.addTextMessage('注文が見つかりませんでした');
              } else {
                ctx.$session.order = latestOrder;
                const createTime = moment(latestOrder.get('createdAt')).format('YYYY/MM/DD HH:mm:ss');
                builder
                  .addConfirm(`作成日時: ${createTime}\n商品名: ${(await latestOrder.getProduct()).get('name')}\n個数: ${latestOrder.get('amount')}個\nを削除しますか？`,
                    '削除する', '削除しない');
              }
            },
          },
        ],
        async handler(ctx, builder) {
          builder.addTextMessage('数字ではないか、大きすぎます。\nもう一度入力してください。');
        },
      },
      async default(ctx, builder) {
        const teams = await ctx.$user.getTeams();
        if (teams.length !== 1) {
          builder
            .addTextMessage('団体を選択してください')
            .addTeamCarousel(teams);
        } else {
          builder.addTextMessage(`> ID: ${teams[0].id} (${teams[0].name})`);
          return ['selectTeam', 'teamId', { teamId: teams[0].id }];
        }
        return undefined;
      },
    },
  },
  showProducts: {
    keyword: '商品一覧',
    state: {
      async addNewName(ctx, builder, event) {
        ctx.$session.newProduct = { name: event.message.text.trim() };
        ctx.$session.state = 'addNewPrice';
        builder.addTextMessage('金額を教えてください');
      },
      async addNewPrice(ctx, builder, event) {
        const price = parseInt(event.message.text, 10);
        if (!Number.isInteger(price)) {
          builder.addTextMessage('数字ではないか大きすぎます.\nもう一度入力してください');
        } else {
          ctx.$session.newProduct.price = price;
          ctx.$session.state = 'addNewConfirm';
          builder
          // eslint-disable-next-line no-irregular-whitespace
            .addConfirm(`商品名: ${ctx.$session.newProduct.name}\n　価格: ${ctx.$session.newProduct.price}円\nで追加します.よろしいですか`,
              '追加する', '追加しない');
        }
      },
      async addNewConfirm(ctx, builder, event, middleware) {
        if (event.message.text.trim() === '追加する') {
          await Database.addProduct(ctx.$session.newProduct.name,
            ctx.$session.newProduct.price, ctx.$session.teamId);
          // eslint-disable-next-line no-irregular-whitespace
          builder.addTextMessage(`商品名: ${ctx.$session.newProduct.name}\n　価格: ${ctx.$session.newProduct.price}円\nで追加しました`);
        } else {
          // eslint-disable-next-line no-irregular-whitespace
          builder.addTextMessage('追加をキャンセルしました');
        }
        middleware.deleteSession(ctx);
        builder
          .addTextMessage('何をしますか？')
          .addRichMenu();
      },
      async confirmDelete(ctx, builder, event, middleware) {
        if (event.message.text.trim() === '削除する') {
          await Database.deleteProduct(ctx.$session.product.get('id'), ctx.$session.teamId);
          builder.addTextMessage(`${ctx.$session.product.get('name')} (${ctx.$session.product.get('price')}円)を削除しました.`);
        } else {
          builder.addTextMessage('削除をキャンセルしました');
        }
        middleware.deleteSession(ctx);
        builder.addTextMessage('何をしますか?').addRichMenu();
      },
      async selectTeam(ctx, builder, event) {
        ctx.$session.teamId = parseInt(event.message.text.trim().match(/ID:\s*(\d+)\s*を選択/)[1], 10);
        builder
          .addProductCarousel(await Database.findProducts(ctx.$session.teamId), true, true, false);
        ctx.$session.state = undefined;
      },
      async default(ctx, builder, event) {
        let match;
        const text = event.message.text.trim();
        switch (text) {
          case '新規追加':
            ctx.$session.state = 'addNewName';
            builder
              .addTextMessage('商品名を教えてください');
            break;
          case (match = text.match(/ID:\s*(\d+)\s*を削除/)) ? text : undefined: { // eslint-disable-line
            const productId = parseInt(match[1], 10);
            ctx.$session.product = await Database.findProduct(productId);
            ctx.$session.state = 'confirmDelete';
            builder
              .addConfirm(`${ctx.$session.product.get('name')} (${ctx.$session.product.get('price')}円)を削除します.\nよろしいですか?`,
                '削除する', '削除しない');
            break;
          }
          default: {
            const teams = await ctx.$user.getTeams();
            if (teams.length === 1) {
              ctx.$session.teamId = teams[0].id;
              builder
                .addTextMessage(`> ID: ${teams[0].id} (${teams[0].name})`)
                .addProductCarousel(await Database.findProducts(ctx.$session.teamId),
                  true, true, false);
            } else {
              builder
                .addTextMessage('団体を選択してください')
                .addTeamCarousel(teams);
              ctx.$session.state = 'selectTeam';
            }
            break;
          }
        }
      },
    },
  },
  showNowOrder: {
    keyword: '現在の売上を確認',
    state: {
      selectTeam: {
        patterns: [
          {
            name: 'teamId',
            pattern: /(?<teamId>\d+)/,
            async handler(ctx, builder, event, middleware, { teamId }) {
              ctx.$session.teamId = teamId;
              const productsTotal = await Database.getTotal(ctx.$session.teamId);
              const total = productsTotal.reduce((prev, next) => {
                const { amount, ticket, subtotal } = next;
                /* eslint-disable no-param-reassign */
                prev.amount += amount;
                prev.ticket += ticket;
                prev.sum += subtotal;
                return prev;
              }, { ticket: 0, amount: 0, sum: 0 });
              builder.addTextMessage(`食券: ${total.ticket}\n個数: ${total.amount}\n金額: ${total.sum}円`);
              middleware.deleteSession(ctx);
            },
          },
        ],
        async handler(ctx, builder) {
          builder.addTextMessage('数字ではないか、大きすぎます。\nもう一度入力してください。');
        },
      },
      async default(ctx, builder) {
        const teams = await ctx.$user.getTeams();
        ctx.$session.state = 'selectTeam';
        if (teams.length !== 1) {
          builder.addTextMessage('団体を選択してください').addTeamCarousel(teams);
        } else {
          builder.addTextMessage(`> ID: ${teams[0].id} (${teams[0].name})`);
          return ['selectTeam', 'teamId', { teamId: teams[0].id }];
        }
        return undefined;
      },
    },
  },
  cancel: {
    keyword: 'キャンセル',
    state: {
      default(ctx, builder, event, middleware) {
        middleware.deleteSession(ctx);
        builder.addTextMessage('キャンセルしました\n何をしますか?').addRichMenu();
      },
    },
  },
};

class LINEMiddleware {
  constructor() {
    this.sessions = {};
    this.registrationCodeChars = '0123456789';
    this.registrationQueue = {};
  }

  generateRegistrationCode(len = 4) {
    const cl = this.registrationCodeChars.length;
    let r = '';
    for (let i = 0; i < len; i += 1) {
      r += this.registrationCodeChars[Math.floor(Math.random() * cl)];
    }
    if (this.registrationQueue[r]) {
      return this.generateRegistrationCode(len);
    }
    return r;
  }

  deleteSession(ctx) {
    delete this.sessions[ctx.request.body.events[0].source.userId];
    delete ctx.$session;
  }

  middleware() {
    return async (ctx) => {
      ctx.status = 200;
      if (ctx.request.body.events && ctx.request.body.events.length === 1) {
        const event = ctx.request.body.events[0];
        const { type, message, source } = event;
        if (type === 'message' && message.type === 'text' && source.type === 'user') {
          const text = message.text.trim();
          ctx.$user = await Database.findUser(source.userId);
          const builder = new LINE.Builder(event.replyToken);
          const actionKey = Object.keys(actions).find(a => actions[a].keyword === text);
          if (!ctx.$user) {
            const queueElement = this.registrationQueue[text];
            if (queueElement && queueElement.resolve) {
              queueElement.resolve(source.userId);
              builder.addTextMessage('認証完了しました');
            } else {
              builder.addTextMessage(`登録が必要です。\nhttps://${Config.BASE_URL}\nにアクセスして登録して下さい。`);
            }
          } else if (this.sessions[source.userId] || actionKey) {
            if (!this.sessions[source.userId]
              || (actionKey && this.sessions[source.userId].action !== actionKey)) {
              this.sessions[source.userId] = { action: actionKey };
            }
            ctx.$session = this.sessions[source.userId];
            const action = actions[ctx.$session.action];
            /*
            state = function -> call only
            state = object
              patterns: [{
                name: string,
                pattern: {Regexp},
                handler: call function
              }]
              handler: call function
            -> [String, String, Any] {state, patternName, Arguments}
            */
            let firstCall = true;
            let fallState = ctx.$session.state;
            /* eslint-disable no-await-in-loop, no-loop-func */
            while (firstCall || fallState) {
              firstCall = false;
              const arrayState = Array.isArray(fallState);
              if (!arrayState) fallState = [fallState, undefined, undefined];
              const state = action.state[fallState[0]] || action.state.default;
              if (typeof state === 'function') {
                fallState = await state(ctx, builder, event, this, fallState[2]);
              } else if (state.patterns && (fallState[1] || !arrayState)) {
                const pattern = state.patterns
                  .find(p => (arrayState ? p.name === fallState[1] : p.pattern.test(text) && p));
                if (pattern) {
                  if (!arrayState) fallState[2] = pattern.pattern.exec(text).groups;
                  fallState = await pattern.handler(ctx, builder, event, this, fallState[2]);
                } else {
                  fallState = await state.handler(ctx, builder, event, this, fallState[2]);
                }
              } else {
                fallState = await state.handler(ctx, builder, event, this, fallState[2]);
              }
            }
          } else {
            builder.addTextMessage('何をしますか？').addRichMenu();
          }
          builder.send();
        }
      }
    };
  }
}

const lineMiddleware = new LINEMiddleware();
export default lineMiddleware;
