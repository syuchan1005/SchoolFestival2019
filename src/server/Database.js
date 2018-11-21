import Sequelize from 'sequelize';
import debug from 'debug';
import { parse as json2csv } from 'json2csv';
import _ from 'lodash';

import Config from '../../config';
import moment from 'moment';

const logger = debug('main:sql');

/* eslint-disable no-return-await */
class Database {
  constructor(fileName) {
    this.sequelize = new Sequelize({
      database: 'database',
      dialect: 'sqlite',
      storage: `${__dirname}/../../${fileName}`,
      operatorsAliases: false,
      logging: v => logger(v),
    });
    this.tempToken = {
      left: ['admiring', 'adoring', 'affectionate', 'agitated', 'amazing', 'angry', 'awesome', 'blissful', 'bold', 'boring', 'brave', 'charming', 'clever', 'cocky', 'cool', 'compassionate', 'competent', 'condescending', 'confident', 'cranky', 'crazy', 'dazzling', 'determined', 'distracted', 'dreamy', 'eager', 'ecstatic', 'elastic', 'elated', 'elegant', 'eloquent', 'epic', 'fervent', 'festive', 'flamboyant', 'focused', 'friendly', 'frosty', 'gallant', 'gifted', 'goofy', 'gracious', 'happy', 'hardcore', 'heuristic', 'hopeful', 'hungry', 'infallible', 'inspiring', 'jolly', 'jovial', 'keen', 'kind', 'laughing', 'loving', 'lucid', 'magical', 'mystifying', 'modest', 'musing', 'naughty', 'nervous', 'nifty', 'nostalgic', 'objective', 'optimistic', 'peaceful', 'pedantic', 'pensive', 'practical', 'priceless', 'quirky', 'quizzical', 'recursing', 'relaxed', 'reverent', 'romantic', 'sad', 'serene', 'sharp', 'silly', 'sleepy', 'stoic', 'stupefied', 'suspicious', 'sweet', 'tender', 'thirsty', 'trusting', 'unruffled', 'upbeat', 'vibrant', 'vigilant', 'vigorous', 'wizardly', 'wonderful', 'xenodochial', 'youthful', 'zealous', 'zen'],
      right: ['albattani', 'allen', 'almeida', 'antonelli', 'agnesi', 'archimedes', 'ardinghelli', 'aryabhata', 'austin', 'babbage', 'banach', 'banzai', 'bardeen', 'bartik', 'bassi', 'beaver', 'bell', 'benz', 'bhabha', 'bhaskara', 'black', 'blackburn', 'blackwell', 'bohr', 'booth', 'borg', 'bose', 'boyd', 'brahmagupta', 'brattain', 'brown', 'burnell', 'buck', 'burnell', 'cannon', 'carson', 'cartwright', 'chandrasekhar', 'chaplygin', 'chatelet', 'chatterjee', 'chebyshev', 'cocks', 'cohen', 'chaum', 'clarke', 'colden', 'cori', 'cray', 'curran', 'curie', 'darwin', 'davinci', 'dewdney', 'dhawan', 'diffie', 'dijkstra', 'dirac', 'driscoll', 'dubinsky', 'easley', 'edison', 'einstein', 'elbakyan', 'elgamal', 'elion', 'ellis', 'engelbart', 'euclid', 'euler', 'faraday', 'feistel', 'fermat', 'fermi', 'feynman', 'franklin', 'gagarin', 'galileo', 'galois', 'ganguly', 'gates', 'gauss', 'germain', 'goldberg', 'goldstine', 'goldwasser', 'golick', 'goodall', 'gould', 'greider', 'grothendieck', 'haibt', 'hamilton', 'haslett', 'hawking', 'hellman', 'heisenberg', 'hermann', 'herschel', 'hertz', 'heyrovsky', 'hodgkin', 'hofstadter', 'hoover', 'hopper', 'hugle', 'hypatia', 'ishizaka', 'jackson', 'jang', 'jennings', 'jepsen', 'johnson', 'joliot', 'jones', 'kalam', 'kapitsa', 'kare', 'keldysh', 'keller', 'kepler', 'khayyam', 'khorana', 'kilby', 'kirch', 'knuth', 'kowalevski', 'lalande', 'lamarr', 'lamport', 'leakey', 'leavitt', 'lederberg', 'lehmann', 'lewin', 'lichterman', 'liskov', 'lovelace', 'lumiere', 'mahavira', 'margulis', 'matsumoto', 'maxwell', 'mayer', 'mccarthy', 'mcclintock', 'mclaren', 'mclean', 'mcnulty', 'mendel', 'mendeleev', 'meitner', 'meninsky', 'merkle', 'mestorf', 'minsky', 'mirzakhani', 'moore', 'morse', 'murdock', 'moser', 'napier', 'nash', 'neumann', 'newton', 'nightingale', 'nobel', 'noether', 'northcutt', 'noyce', 'panini', 'pare', 'pascal', 'pasteur', 'payne', 'perlman', 'pike', 'poincare', 'poitras', 'proskuriakova', 'ptolemy', 'raman', 'ramanujan', 'ride', 'montalcini', 'ritchie', 'rhodes', 'robinson', 'roentgen', 'rosalind', 'rubin', 'saha', 'sammet', 'sanderson', 'shannon', 'shaw', 'shirley', 'shockley', 'shtern', 'sinoussi', 'snyder', 'solomon', 'spence', 'sutherland', 'stallman', 'stonebraker', 'swanson', 'swartz', 'swirles', 'taussig', 'tereshkova', 'tesla', 'tharp', 'thompson', 'torvalds', 'tu', 'turing', 'varahamihira', 'vaughan', 'visvesvaraya', 'volhard', 'villani', 'wescoff', 'wiles', 'williams', 'williamson', 'wilson', 'wing', 'wozniak', 'wright', 'wu', 'yalow', 'yonath', 'zhukovsky'],
      user: {},
    };
  }

  authenticate() {
    this.models = {
      team: this.sequelize.define('team', {
        name: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
      }),
      user: this.sequelize.define('user', {
        lineUserId: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        studentNumber: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
      }),
      userTeam: this.sequelize.define('user_team', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        userId: {
          type: Sequelize.INTEGER,
          unique: 'user_team_unique',
        },
        teamId: {
          type: Sequelize.INTEGER,
          unique: 'user_team_unique',
        },
      }),
      token: this.sequelize.define('token', {
        temporaryToken: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        token: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        expiredAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        /* userId */
      }),
      product: this.sequelize.define('product', {
        name: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: 'name-price',
        },
        price: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: 'name-price',
        },
        teamId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: 'name-price',
        },
        /* deletedAt */
      }, { paranoid: true }),
      order: this.sequelize.define('order', {
        amount: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        ticket: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        /* productId */
      }),
    };

    this.models.user.belongsToMany(this.models.team, {
      through: {
        model: this.models.userTeam,
        unique: false,
      },
      foreignKey: 'userId',
      constraints: false,
    });
    this.models.team.belongsToMany(this.models.user, {
      through: {
        model: this.models.userTeam,
        unique: false,
      },
      foreignKey: 'teamId',
      constraints: false,
    });

    this.models.user.hasMany(this.models.token, { foreignKey: 'userId' });
    this.models.token.belongsTo(this.models.user, { foreignKey: 'userId' });

    this.models.product.belongsTo(this.models.team, { foreignKey: 'teamId' });
    this.models.team.hasMany(this.models.product, { foreignKey: 'teamId' });

    this.models.order.belongsTo(this.models.product, { foreignKey: 'productId' });
    this.models.product.hasMany(this.models.order, { foreignKey: 'productId' });

    return Object.values(this.models)
      .reduce((prev, next) => prev.then(() => next.sync()),
        this.sequelize.authenticate());
  }

  async findOrCreateTemporaryToken(userId) {
    let token = await this.generateTemporaryToken();
    let retry = 0;
    while (this.tempToken.user[token]) {
      if (retry === 10) {
        token = `${userId}_${token}`;
        break;
      }
      // eslint-disable-next-line
      token = await this.generateTemporaryToken();
      retry += 1;
    }
    this.tempToken.user[token] = {
      timeout: setTimeout(() => {
        delete this.tempToken.user[token];
      }, Config.TEMPORARY_TOKEN_WAIT),
      token,
      expiredAt: moment().add(Config.TEMPORARY_TOKEN_WAIT, 'ms').toISOString(),
      userId,
    };
    return this.tempToken.user[token];
  }

  async generateTemporaryToken() {
    const left = Math.round(Math.random() * this.tempToken.left.length - 1);
    const right = Math.round(Math.random() * this.tempToken.right.length - 1);
    return `${this.tempToken.left[left]}_${this.tempToken.right[right]}`;
  }

  async findUser(lineUserId) {
    /**
     * @property getTeams {Promise<Object>}
     */
    return this.models.user.findOne({
      where: { lineUserId },
    });
  }

  async deleteUser(lineUserId) {
    const user = await this.findUser(lineUserId);
    const teams = await user.getTeams();
    /* eslint-disable */
    for (const team of teams) {
      await user.removeTeam(team);
    }
    /* eslint-enable */
    return this.models.user.destroy({
      where: { lineUserId },
    });
  }

  /**
   * find or create user
   * @param lineUserId string
   * @param studentNumber string
   * @param teamNames Array<string>
   * @returns {Promise<[Sequelize.Model, Boolean]>} [model, isCreate]
   */
  async findOrCreateUser(lineUserId, studentNumber, teamNames) {
    let user = await this.models.user.findOne({ where: { lineUserId } });
    if (user) return [user, false];
    user = await this.models.user.create({ lineUserId, studentNumber });
    /* eslint-disable */
    for (const name of teamNames) {
      const model = await this.models.team.findOrCreate({
        where: { name }, defaults: { name },
      }).then(models => models[0]);
      user.addTeam(model);
    }
    /* eslint-enable */
    return Promise.resolve([user, true]);
  }

  /**
   * update user teams
   * @param lineUserId string
   * @param teamNames Array<string>
   * @returns {Promise<[Sequelize.Model, Boolean]>} [model, isCreate]
   */
  async updateUserTeams(lineUserId, teamNames) {
    const user = await this.findUser(lineUserId);
    const joinedTeams = await user.getTeams();
    /* eslint-disable */
    /* 削除したチームをDBから削除 */
    const deleteTeams = _.difference(joinedTeams.map(v => v.get('name')), teamNames);
    for (const name of deleteTeams) {
      const team = joinedTeams.find(v => v.get('name') === name);
      await user.removeTeam(team);
    }
    /* 追加されたチームをDBに追加 */
    const addedTeam = _.difference(teamNames, joinedTeams.map(v => v.get('name')));
    for (const name of addedTeam) {
      const team = await this.models.team.findOrCreate({ where: { name }, defaults: { name } });
      await user.addTeam(team[0]);
    }
    /* eslint-enable */
    return this.models.user.findOne({
      where: { lineUserId },
    }).then(model => [model, false]);
  }

  findTeam(teamId) {
    return this.models.team.findOne({
      where: { id: teamId },
    });
  }

  getTeamData(teamId) {
    return this.models.team.findOne({
      attributes: ['id', 'name'],
      where: { id: teamId },
      include: [{
        model: this.models.product,
        attributes: ['id', 'name', 'price'],
      }],
    });
  }

  findProducts(teamId) {
    return this.models.product.findAll({
      where: { teamId },
    });
  }

  async addProduct(name, price, teamId) {
    await this.models.product.upsert({
      name,
      price,
      teamId,
      deletedAt: null,
    }, { where: { name, price, teamId } });
    return this.models.product.findOne({ where: { name, price, teamId } });
  }

  deleteProduct(productId, teamId) {
    return this.models.product.destroy({
      where: {
        id: productId,
        teamId,
      },
    });
  }

  findProduct(productId) {
    return this.models.product.findOne({
      where: { id: productId },
    });
  }

  addOrder(productId, amount, ticket) {
    return this.models.order.create({
      productId,
      amount,
      ticket,
    });
  }

  findLatestOrder(teamId) {
    /**
     * @property getProduct {Promise<Object>}
     */
    return this.models.order.findOne({
      order: [['updatedAt', 'DESC']],
      include: [{ model: this.models.product, required: true, where: { teamId } }],
    });
  }

  deleteOrder(orderId, teamId) {
    return this.models.order.destroy({
      where: { id: orderId },
      include: [{ model: this.models.product, required: true, where: { teamId } }],
    });
  }

  getTotal(teamId) {
    return this.sequelize.query(
      `SELECT name, price, amount, ticket, amount * price as subtotal
            FROM products
            INNER JOIN (SELECT SUM(amount) as amount, SUM(ticket) as ticket, productId FROM orders GROUP BY productId) AS orders
            WHERE teamId = ${teamId} AND products.id = orders.productId;`,
      {
        type: Sequelize.QueryTypes.SELECT,
      },
    );
  }

  /**
   * @param productId Number
   * @param date string format(YYYY-MM-DD)
   * @param startTime string format(HH:mm)
   * @param endTime string format(HH:mm)
   * @param minutes number
   * @returns {Promise<Array<Object>>}
   */
  getInfo(productId, date, startTime, endTime, minutes) {
    return this.sequelize.query(
      `SELECT  strftime('%H:%M', strftime('%s', orders.createdAt) / (60 * ${minutes}) * (60 * ${minutes}),
                     'unixepoch', 'localtime') AS time,
                   SUM(amount) AS amount
            FROM orders INNER JOIN products p on orders.productId = p.id
            WHERE productId = ${productId}
              AND strftime('%Y-%m-%d %H:%M:%S', orders.createdAt, 'localtime') >= '${date} ${startTime}:00'
              AND strftime('%Y-%m-%d %H:%M:%S', orders.createdAt, 'localtime') <= '${date} ${endTime}:00'
              GROUP BY productId , strftime('%s', orders.createdAt, 'localtime') / (60 * ${minutes})
            ORDER BY productId ASC`,
      {
        type: Sequelize.QueryTypes.SELECT,
      },
    );
  }

  async getCSVData(teamId) {
    const data = await this.sequelize.query(`
      SELECT
        t.name                                                       as teamName,
        orders.id                                                    as orderId,
        amount,
        ticket,
        productId,
        p.name,
        price,
        amount * price                                               as subtotal,
        strftime('%Y-%m-%d %H:%M:%f', orders.createdAt, 'localtime') as createdAt
      FROM orders
             INNER JOIN products p on orders.productId = p.id
             INNER JOIN teams t on p.teamId = t.id
      WHERE teamId = ${teamId}`, {
      type: Sequelize.QueryTypes.SELECT,
    });
    return json2csv(data);
  }

  async hasProduct(userId, productId) {
    const data = await this.models.user.findOne({
      attributes: [],
      where: { id: userId },
      include: [{
        attributes: [],
        model: this.models.team,
        required: true,
        include: [{
          attributes: [],
          model: this.models.product,
          where: { id: productId },
          required: true,
        }],
      }],
    });
    return !!data;
  }

  async hasOrder(userId, orderId) {
    const order = await this.models.order.findOne({ where: { id: orderId } });
    if (!order) return false;
    return this.hasProduct(userId, order.productId);
  }

  async getTeamOrders(teamId) {
    const orders = await this.models.order.findAll({
      include: [{
        model: this.models.product,
        paranoid: false,
        required: true,
        include: [{
          model: this.models.team,
          required: true,
          where: { id: teamId },
        }],
      }],
      order: [['createdAt', 'DESC']],
    });
    return {
      products: orders
        .filter((o, i) => orders.map(v => v.productId).indexOf(o.productId) === i)
        .map(o => o.product),
      orders,
    };
  }
}

const db = new Database(`${process.env.NODE_ENV || 'test'}.sqlite`);
export default db;
