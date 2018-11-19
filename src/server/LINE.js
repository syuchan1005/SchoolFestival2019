import axios from 'axios';
import Config from '../../config';

class LINE {
  static get $http() {
    return axios.create({
      method: 'POST',
      baseURL: 'https://api.line.me/v2/bot',
      headers: {
        Authorization: `Bearer ${Config.MESSAGING_API.LINE_ACCESS_TOKEN}`,
      },
    });
  }

  static get menu() {
    return {
      type: 'imagemap',
      baseUrl: `https://${Config.BASE_URL}/images/menu`,
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
          text: '商品一覧',
          area: {
            x: 10,
            y: 853,
            width: 1230,
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
        width: 1040,
        height: 1350,
      },
      actions: [
        {
          type: 'message',
          text: '1',
          area: {
            x: 30,
            y: 30,
            width: 300,
            height: 300,
          },
        }, {
          type: 'message',
          text: '2',
          area: {
            x: 360,
            y: 30,
            width: 300,
            height: 300,
          },
        }, {
          type: 'message',
          text: '3',
          area: {
            x: 690,
            y: 30,
            width: 300,
            height: 300,
          },
        }, {
          type: 'message',
          text: '4',
          area: {
            x: 30,
            y: 360,
            width: 300,
            height: 300,
          },
        }, {
          type: 'message',
          text: '5',
          area: {
            x: 360,
            y: 360,
            width: 300,
            height: 300,
          },
        }, {
          type: 'message',
          text: '6',
          area: {
            x: 690,
            y: 360,
            width: 300,
            height: 300,
          },
        }, {
          type: 'message',
          text: '7',
          area: {
            x: 30,
            y: 690,
            width: 300,
            height: 300,
          },
        }, {
          type: 'message',
          text: '8',
          area: {
            x: 360,
            y: 690,
            width: 300,
            height: 300,
          },
        }, {
          type: 'message',
          text: '9',
          area: {
            x: 690,
            y: 690,
            width: 300,
            height: 300,
          },
        }, {
          type: 'message',
          text: 'キャンセル',
          area: {
            x: 30,
            y: 1020,
            width: 960,
            height: 300,
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
        width: 1040,
        height: 1350,
      },
      actions: [
        {
          type: 'message',
          text: '1',
          area: {
            x: 30,
            y: 30,
            width: 300,
            height: 300,
          },
        }, {
          type: 'message',
          text: '2',
          area: {
            x: 360,
            y: 30,
            width: 300,
            height: 300,
          },
        }, {
          type: 'message',
          text: '3',
          area: {
            x: 690,
            y: 30,
            width: 300,
            height: 300,
          },
        }, {
          type: 'message',
          text: '4',
          area: {
            x: 30,
            y: 360,
            width: 300,
            height: 300,
          },
        }, {
          type: 'message',
          text: '5',
          area: {
            x: 360,
            y: 360,
            width: 300,
            height: 300,
          },
        }, {
          type: 'message',
          text: '6',
          area: {
            x: 690,
            y: 360,
            width: 300,
            height: 300,
          },
        }, {
          type: 'message',
          text: '7',
          area: {
            x: 30,
            y: 690,
            width: 300,
            height: 300,
          },
        }, {
          type: 'message',
          text: '8',
          area: {
            x: 360,
            y: 690,
            width: 300,
            height: 300,
          },
        }, {
          type: 'message',
          text: '9',
          area: {
            x: 690,
            y: 690,
            width: 300,
            height: 300,
          },
        }, {
          type: 'message',
          text: '0',
          area: {
            x: 30,
            y: 1020,
            width: 630,
            height: 300,
          },
        }, {
          type: 'message',
          text: 'キャンセル',
          area: {
            x: 690,
            y: 1020,
            width: 300,
            height: 300,
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

  static teamCarousel(teams) {
    return {
      type: 'template',
      altText: 'Team Carousel',
      template: {
        type: 'carousel',
        columns: teams.map(team => ({
          title: team.name,
          text: `ID: ${team.id}`,
          actions: [{
            type: 'message',
            label: 'これにする',
            text: team.id,
          }],
        })),
      },
    };
  }

  static getContent(messageId) {
    return LINE.$http({
      method: 'GET',
      url: `/message/${messageId}/content`,
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });
  }
}

LINE.Builder = class Builder {
  constructor(replyToken) {
    this.replyToken = replyToken;
    this.messages = [];
  }

  /**
   * @returns {LINE.Builder}
   */
  addTextMessage(text) {
    this.messages.push({
      type: 'text',
      text,
    });
    return this;
  }

  /**
   * @returns {LINE.Builder}
   */
  addKeyPadWithCancel() {
    this.messages.push(LINE.keypadWithCancel);
    return this;
  }

  /**
   * @returns {LINE.Builder}
   */
  addKeyPadWithZero() {
    this.messages.push(LINE.keypadWithZero);
    return this;
  }

  /**
   * @returns {LINE.Builder}
   */
  addRichMenu() {
    this.messages.push(LINE.menu);
    return this;
  }

  /**
   * @returns {LINE.Builder}
   */
  addProductCarousel(products, showAdd, showDelete, showSelect) {
    this.messages.push(LINE.productCarousel(products, showAdd, showDelete, showSelect));
    return this;
  }

  /**
   * @returns {LINE.Builder}
   */
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

  /**
   * @returns {LINE.Builder}
   */
  addTeamCarousel(teams) {
    this.messages.push(LINE.teamCarousel(teams));
    return this;
  }

  /**
   * @returns {LINE.Builder}
   */
  send() {
    return LINE.$http({
      url: '/message/reply',
      data: this,
    }).catch(v => console.error(v.response.data)); // eslint-disable-line no-console
  }
};

export default LINE;
