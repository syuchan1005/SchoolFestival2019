import axios from 'axios';
import Config from '../config';

class LINE {
  static get $http() {
    return axios.create({
      method: 'POST',
      baseURL: 'https://api.line.me/v2/bot',
    });
  }

  static get richmenu() {
    return {
      type: 'imagemap',
      baseUrl: `https://${Config.BASE_URL}/images/richmenu-869cbcc36de417c5b7a0fc91e551c12b`,
      altText: 'RichMenu',
      baseSize: {
        width: 2500,
        height: 1686,
      },
      actions: [
        {
          type: 'message',
          text: '注文を追加',
          area: {
            x: 10,
            y: 10,
            width: 1230,
            height: 823,
          },
        },
        {
          type: 'message',
          text: '最後の注文を削除',
          area: {
            x: 1250,
            y: 10,
            width: 1230,
            height: 823,
          },
        },
        {
          type: 'message',
          text: '団体名を設定',
          area: {
            x: 10,
            y: 853,
            width: 610,
            height: 823,
          },
        },
        {
          type: 'message',
          text: '商品一覧',
          area: {
            x: 630,
            y: 853,
            width: 610,
            height: 823,
          },
        },
        {
          type: 'message',
          text: '現在の売上を確認',
          area: {
            x: 1250,
            y: 853,
            width: 1230,
            height: 823,
          },
        },
      ],
    };
  }

  static get keypadWithCancel() {
    return {
      type: 'imagemap',
      baseUrl: `https://${Config.BASE_URL}/images/keypadWithCancel`,
      altText: 'This is amount selector. type number',
      baseSize: {
        width: 340,
        height: 450,
      },
      actions: [
        {
          type: 'message',
          text: '1',
          area: {
            x: 10,
            y: 10,
            width: 100,
            height: 100,
          },
        }, {
          type: 'message',
          text: '2',
          area: {
            x: 120,
            y: 10,
            width: 100,
            height: 100,
          },
        }, {
          type: 'message',
          text: '3',
          area: {
            x: 230,
            y: 10,
            width: 100,
            height: 100,
          },
        }, {
          type: 'message',
          text: '4',
          area: {
            x: 10,
            y: 120,
            width: 100,
            height: 100,
          },
        }, {
          type: 'message',
          text: '5',
          area: {
            x: 120,
            y: 120,
            width: 100,
            height: 100,
          },
        }, {
          type: 'message',
          text: '6',
          area: {
            x: 230,
            y: 120,
            width: 100,
            height: 100,
          },
        }, {
          type: 'message',
          text: '7',
          area: {
            x: 10,
            y: 230,
            width: 100,
            height: 100,
          },
        }, {
          type: 'message',
          text: '8',
          area: {
            x: 120,
            y: 230,
            width: 100,
            height: 100,
          },
        }, {
          type: 'message',
          text: '9',
          area: {
            x: 230,
            y: 230,
            width: 100,
            height: 100,
          },
        }, {
          type: 'message',
          text: 'キャンセル',
          area: {
            x: 10,
            y: 340,
            width: 320,
            height: 100,
          },
        },
      ],
    };
  }

  static get keypadWithZero() {
    return {
      type: 'imagemap',
      baseUrl: `https://${Config.BASE_URL}/images/keypadWithZero`,
      altText: 'This is amount selector. type number',
      baseSize: {
        width: 340,
        height: 450,
      },
      actions: [
        {
          type: 'message',
          text: '1',
          area: {
            x: 10,
            y: 10,
            width: 100,
            height: 100,
          },
        }, {
          type: 'message',
          text: '2',
          area: {
            x: 120,
            y: 10,
            width: 100,
            height: 100,
          },
        }, {
          type: 'message',
          text: '3',
          area: {
            x: 230,
            y: 10,
            width: 100,
            height: 100,
          },
        }, {
          type: 'message',
          text: '4',
          area: {
            x: 10,
            y: 120,
            width: 100,
            height: 100,
          },
        }, {
          type: 'message',
          text: '5',
          area: {
            x: 120,
            y: 120,
            width: 100,
            height: 100,
          },
        }, {
          type: 'message',
          text: '6',
          area: {
            x: 230,
            y: 120,
            width: 100,
            height: 100,
          },
        }, {
          type: 'message',
          text: '7',
          area: {
            x: 10,
            y: 230,
            width: 100,
            height: 100,
          },
        }, {
          type: 'message',
          text: '8',
          area: {
            x: 120,
            y: 230,
            width: 100,
            height: 100,
          },
        }, {
          type: 'message',
          text: '9',
          area: {
            x: 230,
            y: 230,
            width: 100,
            height: 100,
          },
        }, {
          type: 'message',
          text: '0',
          area: {
            x: 10,
            y: 340,
            width: 210,
            height: 100,
          },
        }, {
          type: 'message',
          text: 'キャンセル',
          area: {
            x: 230,
            y: 340,
            width: 100,
            height: 100,
          },
        },
      ],
    };
  }

  static productCarousel(products, showAdd, showDelete, showSelect) {
    const texts = [];
    const columns = products.map((model) => {
      const actions = [];
      if (showSelect) {
        actions.push({
          type: 'message',
          label: 'これにする',
          text: `ID:${model.get('id')}を選択`,
        });
      }
      if (showDelete) {
        actions.push({
          type: 'message',
          label: '削除する',
          text: `ID:${model.get('id')}を削除`,
        });
      }
      return {
        title: `${model.get('name')} (${model.get('price')}円)`,
        text: `ID: ${model.get('id')}`,
        actions,
      };
    });
    if (showAdd) {
      columns.push({
        title: '新規商品',
        text: '新しい商品を追加する',
        actions: [{
          type: 'message',
          label: '追加する',
          text: '新規追加',
        }],
      });
      texts.push('新規追加');
    }
    return {
      type: 'template',
      altText: `Product Carousel [${texts.join('/')}]`,
      template: {
        type: 'carousel',
        columns,
      },
    };
  }
}

LINE.Builder = class Builder {
  constructor(replyToken) {
    this.replyToken = replyToken;
    this.messages = [];
  }

  addTextMessage(text) {
    this.messages.push({
      type: 'text',
      text,
    });
    return this;
  }

  addKeyPadWithCancel() {
    this.messages.push(LINE.keypadWithCancel);
    return this;
  }

  addKeyPadWithZero() {
    this.messages.push(LINE.keypadWithZero);
    return this;
  }

  addRichMenu() {
    this.messages.push(LINE.richmenu);
    return this;
  }

  addProductCarousel(products, showAdd, showDelete, showSelect) {
    this.messages.push(LINE.productCarousel(products, showAdd, showDelete, showSelect));
    return this;
  }

  addConfirm(text, yes, no) {
    const yesText = yes || 'はい';
    const noText = no || 'いいえ';
    this.messages.push({
      type: 'template',
      altText: `${text} [${yesText}/${noText}]`,
      template: {
        type: 'confirm',
        text,
        actions: [
          {
            type: 'message',
            label: yesText,
            text: yesText,
          },
          {
            type: 'message',
            label: noText,
            text: noText,
          },
        ],
      },
    });
    return this;
  }

  send() {
    return LINE.$http({
      url: '/message/reply',
      headers: {
        Authorization: `Bearer ${Config.LINE_ACCESS_TOKEN}`,
      },
      data: this,
    }).catch(v => console.error(v.response.data)); // eslint-disable-line no-console
  }
};

export default LINE;
