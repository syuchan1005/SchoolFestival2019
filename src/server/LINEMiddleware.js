import moment from 'moment';

import LINE from './LINE';
import Database from './Database';

const actions = {
  addOrder: {
    auth: true,
    keyword: '注文を追加',
    async handler(ctx, event, middleware) {
      switch (ctx.$session.state) {
        case 'askProduct': {
          const productId = parseInt(event.message.text.trim().match(/ID:\s*(\d+)\s*を選択/)[1], 10);
          ctx.$session.product = await Database.findProduct(productId);
          ctx.$session.state = 'askAmount';
          new LINE.Builder(event.replyToken)
            .addTextMessage('個数を教えてください')
            .addKeyPadWithCancel()
            .send();
          break;
        }
        case 'askAmount': {
          const amount = parseInt(event.message.text, 10);
          if (!Number.isInteger(amount)) {
            new LINE.Builder(event.replyToken)
              .addTextMessage('数字ではないか大きすぎます.\nもう一度入力してください')
              .send();
          } else {
            ctx.$session.amount = amount;
            ctx.$session.state = 'askTicket';
            new LINE.Builder(event.replyToken)
              .addTextMessage('食券は何枚ありますか?')
              .addKeyPadWithZero()
              .send();
          }
          break;
        }
        case 'askTicket': {
          const ticket = parseInt(event.message.text, 10);
          if (!Number.isInteger(ticket)) {
            new LINE.Builder(event.replyToken)
              .addTextMessage('数字ではないか大きすぎます.\nもう一度入力してください')
              .send();
          } else {
            ctx.$session.ticket = ticket;
            ctx.$session.state = 'confirmAdd';
            new LINE.Builder(event.replyToken)
              .addConfirm(`商品: ${ctx.$session.product.get('name')} (${ctx.$session.product.get('price')}円)\n個数: ${ctx.$session.amount}個\nを追加しますか?`,
                '追加する', '追加しない')
              .send();
          }
          break;
        }
        case 'confirmAdd': {
          const builder = new LINE.Builder(event.replyToken);
          if (event.message.text.trim() === '追加する') {
            await Database.addOrder(ctx.$session.product.get('id'), ctx.$session.amount, ctx.$session.ticket);
            builder.addTextMessage('追加しました.');
          } else {
            builder.addTextMessage('追加をキャンセルしました.');
          }
          middleware.deleteSession(ctx);
          builder.addTextMessage('何をしますか?')
            .addRichMenu()
            .send();
          break;
        }
        default: {
          const products = await Database.findProducts((await (ctx.$user.getTeam()).get('id')));
          if (products.length === 0) {
            new LINE.Builder(event.replyToken)
              .addTextMessage('商品がありません. 商品一覧から追加してください.')
              .send();
            middleware.deleteSession(ctx);
          } else if (products.length === 1) {
            const product = products[0];
            ctx.$session.state = 'askAmount';
            ctx.$session.product = product;
            new LINE.Builder(event.replyToken)
              .addTextMessage('どの商品を追加しますか?')
              .addTextMessage(`> ${product.get('name')} (${product.get('price')}円) ID: ${product.get('id')}`)
              .addTextMessage('個数を教えてください')
              .addKeyPadWithCancel()
              .send();
          } else {
            ctx.$session.state = 'askProduct';
            new LINE.Builder(event.replyToken)
              .addTextMessage('どの商品を追加しますか?')
              .addProductCarousel(products, false, false, true)
              .send();
          }
          break;
        }
      }
    },
  },
  deleteLastOrder: {
    auth: true,
    keyword: '最後の注文を削除',
    async handler(ctx, event, middleware) {
      switch (ctx.$session.state) {
        case 'confirmDelete': {
          const builder = new LINE.Builder(event.replyToken);
          if (event.message.text.trim() === '削除する') {
            await Database.deleteOrder(ctx.$session.order.get('id'), ctx.$user.get('teamId'));
            builder.addTextMessage('削除しました');
          } else {
            builder.addTextMessage('キャンセルしました');
          }
          middleware.deleteSession(ctx);
          builder.addTextMessage('何をしますか?')
            .addRichMenu()
            .send();
          break;
        }
        default: {
          ctx.$session.state = 'confirmDelete';
          const latestOrder = await Database.findLatestOrder(ctx.$user.get('teamId'));
          if (latestOrder === null) {
            new LINE.Builder(event.replyToken)
              .addTextMessage('注文が見つかりませんでした')
              .send();
          } else {
            ctx.$session.order = latestOrder;
            const createTime = moment(latestOrder.get('createdAt')).format('YYYY/MM/DD HH:mm:ss');
            new LINE.Builder(event.replyToken)
              .addConfirm(`作成日時: ${createTime}\n商品名: ${(await latestOrder.getProduct()).get('name')}\n個数: ${latestOrder.get('amount')}個\nを削除しますか？`,
                '削除する', '削除しない')
              .send();
          }
          break;
        }
      }
    },
  },
  settingName: {
    auth: false,
    keyword: '団体名を設定',
    async handler(ctx, event, middleware) {
      switch (ctx.$session.state) {
        case 'confirmChange':
          if (event.message.text.trim() === '変更する') {
            ctx.$session.state = 'askName';
            new LINE.Builder(event.replyToken)
              .addTextMessage('団体名を教えてください')
              .send();
          } else {
            middleware.deleteSession(ctx);
            new LINE.Builder(event.replyToken)
              .addTextMessage('キャンセルしました')
              .addTextMessage('何をしますか?')
              .addRichMenu()
              .send();
          }
          break;
        case 'askName': {
          const name = event.message.text.trim();
          ctx.$session.teamName = name;
          ctx.$session.state = 'confirmInput';
          new LINE.Builder(event.replyToken)
            .addConfirm(`${name} でよろしいですか?`)
            .send();
          break;
        }
        case 'confirmInput': {
          const builder = new LINE.Builder(event.replyToken);
          if (event.message.text.trim() === 'はい') {
            if (ctx.$session.exist) {
              await Database.updateOrCreateUser(event.source.userId, ctx.$session.teamName);
            } else {
              await Database.findOrCreateUser(event.source.userId, ctx.$session.teamName);
            }
            builder.addTextMessage('団体名を設定しました');
          } else {
            builder.addTextMessage('キャンセルしました');
          }
          middleware.deleteSession(ctx);
          builder
            .addTextMessage('何をしますか？')
            .addRichMenu()
            .send();
          break;
        }
        default: {
          const user = await Database.findUser(event.source.userId);
          if (user) {
            ctx.$session.state = 'confirmChange';
            ctx.$session.exist = true;
            new LINE.Builder(event.replyToken)
              .addConfirm(`すでに${(await user.getTeam()).get('name')}が設定されています.\n変更しますか？`,
                '変更する', '変更しない')
              .send(); // 改行
          } else {
            ctx.$session.state = 'askName';
            ctx.$session.exist = false;
            new LINE.Builder(event.replyToken)
              .addTextMessage('団体名を教えてください')
              .send();
          }
          break;
        }
      }
    },
  },
  showProducts: {
    auth: true,
    keyword: '商品一覧',
    async handler(ctx, event, middleware) {
      if (!ctx.$session.state) {
        let match;
        const text = event.message.text.trim();
        switch (text) {
          case '新規追加':
            ctx.$session.state = 'addNewName';
            new LINE.Builder(event.replyToken)
              .addTextMessage('商品名を教えてください')
              .send();
            break;
          case (match = text.match(/ID:\s*(\d+)\s*を削除/)) ? text : undefined: { // eslint-disable-line
            const productId = parseInt(match[1], 10);
            ctx.$session.product = await Database.findProduct(productId);
            ctx.$session.state = 'confirmDelete';
            new LINE.Builder(event.replyToken)
              .addConfirm(`${ctx.$session.product.get('name')} (${ctx.$session.product.get('price')}円)を削除します.\nよろしいですか?`,
                '削除する', '削除しない')
              .send();
            break;
          }
          default:
            new LINE.Builder(event.replyToken)
              .addProductCarousel(await Database.findProducts((await ctx.$user.getTeam()).get('id')), true, true, false)
              .send();
            break;
        }
      } else {
        switch (ctx.$session.state) {
          case 'addNewName':
            ctx.$session.newProduct = { name: event.message.text.trim() };
            ctx.$session.state = 'addNewPrice';
            new LINE.Builder(event.replyToken)
              .addTextMessage('金額を教えてください')
              .send();
            break;
          case 'addNewPrice': {
            const price = parseInt(event.message.text, 10);
            if (!Number.isInteger(price)) {
              new LINE.Builder(event.replyToken)
                .addTextMessage('数字ではないか大きすぎます.\nもう一度入力してください')
                .send();
            } else {
              ctx.$session.newProduct.price = price;
              ctx.$session.state = 'addNewConfirm';
              new LINE.Builder(event.replyToken)
              // eslint-disable-next-line no-irregular-whitespace
                .addConfirm(`商品名: ${ctx.$session.newProduct.name}\n　価格: ${ctx.$session.newProduct.price}円\nで追加します.よろしいですか`,
                  '追加する', '追加しない')
                .send();
            }
            break;
          }
          case 'addNewConfirm': {
            const builder = new LINE.Builder(event.replyToken);
            if (event.message.text.trim() === '追加する') {
              await Database.addProduct(ctx.$session.newProduct.name,
                ctx.$session.newProduct.price,
                (await ctx.$user.getTeam()).get('id'));
              // eslint-disable-next-line no-irregular-whitespace
              builder.addTextMessage(`商品名: ${ctx.$session.newProduct.name}\n　価格: ${ctx.$session.newProduct.price}円\nで追加しました`);
            } else {
              // eslint-disable-next-line no-irregular-whitespace
              builder.addTextMessage('追加をキャンセルしました');
            }
            middleware.deleteSession(ctx);
            builder
              .addTextMessage('何をしますか？')
              .addRichMenu()
              .send();
            break;
          }
          case 'confirmDelete': {
            const builder = new LINE.Builder(event.replyToken);
            if (event.message.text.trim() === '削除する') {
              await Database.deleteProduct(ctx.$session.product.get('id'), (await ctx.$user.getTeam()).get('id'));
              builder.addTextMessage(`${ctx.$session.product.get('name')} (${ctx.$session.product.get('price')}円)を削除しました.`);
            } else {
              builder.addTextMessage('削除をキャンセルしました');
            }
            middleware.deleteSession(ctx);
            builder
              .addTextMessage('何をしますか？')
              .addRichMenu()
              .send();
            break;
          }
          default:
            break;
        }
      }
    },
  },
  showNowOrder: {
    auth: true,
    keyword: '現在の売上を確認',
    async handler(ctx, event, middleware) {
      const productsTotal = await Database.getTotal(ctx.$user.get('teamId'));
      console.log(productsTotal);
      const total = productsTotal.reduce((prev, next) => {
        /* eslint-disable no-param-reassign */
        prev.amount += next.amount;
        prev.ticket += next.ticket;
        prev.sum += next.subtotal;
        return prev;
      }, { ticket: 0, amount: 0, sum: 0 });
      new LINE.Builder(event.replyToken)
        .addTextMessage(`食券数: ${total.ticket}\n個数: ${total.amount}\n金額: ${total.sum}円`)
        .send();
      middleware.deleteSession(ctx);
    },
  },
  cancel: {
    auth: false,
    keyword: 'キャンセル',
    async handler(ctx, event, middleware) {
      /* eslint-disable no-param-reassign */
      middleware.deleteSession(ctx);
      new LINE.Builder(event.replyToken)
        .addTextMessage('キャンセルしました')
        .addTextMessage('何をしますか？')
        .addRichMenu()
        .send();
    },
  },
};

class LINEMiddleware {
  constructor() {
    this.sessions = {};
  }

  deleteSession(ctx) {
    delete this.sessions[ctx.request.body.events[0].source.userId];
    delete ctx.$session;
  }

  middleware() {
    return async (ctx) => {
      ctx.status = 200;
      /* イベントであることを確認 */
      if (ctx.request.body.events && ctx.request.body.events.length === 1) {
        const event = ctx.request.body.events[0];
        /* ユーザーからのメッセージのみ反応する */
        if (event.type === 'message' && event.source.type === 'user') {
          /* sessionがある or キーワードだったら処理続行, 当てはまらない場合はRichMenuのImagemapを送信 */
          if (this.sessions[event.source.userId] || (event.message.type === 'text'
            && Object.values(actions).map(a => a.keyword).includes(event.message.text))) {
            /* アクションを取得して現在のアクションと同じならばそのまま呼び出す
               もし違うアクションの場合は前のアクションを放棄して新しいアクションを呼び出す */
            const action = Object.keys(actions)
              .find(a => actions[a].keyword === event.message.text);
            if (this.sessions[event.source.userId] && action
              && this.sessions[event.source.userId].action !== action) {
              delete this.sessions[event.source.userId];
            }
            if (!this.sessions[event.source.userId]) {
              this.sessions[event.source.userId] = { action };
            }
            ctx.$session = this.sessions[event.source.userId];
            if (actions[ctx.$session.action].auth) {
              const user = await Database.findUser(event.source.userId);
              if (user) {
                ctx.$user = user;
                await actions[ctx.$session.action].handler(ctx, event, this);
              } else {
                this.deleteSession(ctx);
                new LINE.Builder(event.replyToken)
                  .addTextMessage('団体名の設定が必要です')
                  .addTextMessage('何をしますか?')
                  .addRichMenu()
                  .send();
              }
            } else {
              await actions[ctx.$session.action].handler(ctx, event, this);
            }
          } else {
            new LINE.Builder(event.replyToken)
              .addTextMessage('何をしますか？')
              .addRichMenu()
              .send();
          }
        }
      }
    };
  }
}

const lineMiddleware = new LINEMiddleware();
export default lineMiddleware;
