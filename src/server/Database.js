import Sequelize from 'sequelize';
import debug from 'debug';
import { parse as json2csv } from 'json2csv';

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
        /* teamId */
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
        /* teamId */
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

    this.models.user.belongsTo(this.models.team, { foreignKey: 'teamId' });
    this.models.team.hasMany(this.models.user, { foreignKey: 'teamId' });

    this.models.product.belongsTo(this.models.team, { foreignKey: 'teamId' });
    this.models.team.hasMany(this.models.product, { foreignKey: 'teamId' });

    this.models.order.belongsTo(this.models.product, { foreignKey: 'productId' });
    this.models.product.hasMany(this.models.order, { foreignKey: 'productId' });

    return Object.values(this.models)
      .reduce((prev, next) => prev.then(() => next.sync()),
        this.sequelize.authenticate());
  }

  async findUser(lineUserId) {
    return this.models.user.findOne({
      where: { lineUserId },
    });
  }

  /**
   * find or create user
   * @param lineUserId string
   * @param teamName string
   * @returns {Promise<[Sequelize.Model, Boolean]>} [model, isCreate]
   */
  async findOrCreateUser(lineUserId, teamName) {
    const user = await this.models.user.findOne({
      where: { lineUserId },
    });
    if (user) return [user, false];
    const team = await this.models.team.findOrCreate({
      where: { name: teamName },
      defaults: { name: teamName },
    }).then(models => models[0]);
    return await this.models.user.create({
      lineUserId,
      teamId: team.get('id'),
    }).then(model => [model, true]);
  }

  /**
   * update or create user
   * @param lineUserId string
   * @param teamName string
   * @returns {Promise<[Sequelize.Model, Boolean]>} [model, isCreate]
   */
  async updateOrCreateUser(lineUserId, teamName) {
    const user = await this.findOrCreateUser(lineUserId, teamName);
    if (user[1]) return user;

    const team = await this.models.team.findOrCreate({
      where: { name: teamName },
      defaults: { name: teamName },
    }).then(models => models[0]);

    await this.models.user.update({ teamId: team.get('id') }, { where: { lineUserId } });

    return await this.models.user.findOne({
      where: { lineUserId },
    }).then(model => [model, false]);
  }

  async findProducts(teamId) {
    return await this.models.product.findAll({
      where: { teamId },
    });
  }

  async addProduct(name, price, teamId) {
    return await this.models.product.create({
      name,
      price,
      teamId,
    });
  }

  async deleteProduct(productId, teamId) {
    return await this.models.product.destroy({
      where: {
        id: productId,
        teamId,
      },
    });
  }

  async findProduct(productId) {
    return await this.models.product.findOne({
      where: { id: productId },
    });
  }

  async addOrder(productId, amount, ticket) {
    return await this.models.order.create({
      productId,
      amount,
      ticket,
    });
  }

  async findLatestOrder(teamId) {
    return await this.models.order.findOne({
      order: [['updatedAt', 'DESC']],
      include: [{ model: this.models.product, required: true, where: { teamId } }],
    });
  }

  async deleteOrder(orderId, teamId) {
    return await this.models.order.destroy({
      where: { id: orderId },
      include: [{ model: this.models.product, required: true, where: { teamId } }],
    });
  }

  async getTotal(teamId) {
    return await this.sequelize.query(
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
   * @param teamId Number
   * @param date string format(YYYY-MM-DD)
   * @param startTime string format(HH:mm)
   * @param endTime string format(HH:mm)
   * @param minutes number
   * @returns {Promise<Array<Object>>}
   */
  async getInfo(teamId, date, startTime, endTime, minutes) {
    const sqlResult = await this.sequelize.query(
      `SELECT
                   productId,
                   p.name || ' (' || p.price || '円)' AS name,
                   strftime('%H:%M',
                     strftime('%s', orders.createdAt) / (60 * ${minutes}) * (60 * ${minutes}),
                     'unixepoch', 'localtime') AS time,
                   SUM(amount) AS amount,
                   SUM(amount) * p.price AS subtotal
            FROM orders
                   INNER JOIN products p on orders.productId = p.id AND p.teamId = ${teamId}
            WHERE strftime('%Y-%m-%d %H:%M:%S', orders.createdAt, 'localtime') >= '${date} ${startTime}:00'
              AND strftime('%Y-%m-%d %H:%M:%S', orders.createdAt, 'localtime') <= '${date} ${endTime}:00'
              GROUP BY productId , strftime('%s', orders.createdAt, 'localtime') / (60 * ${minutes})
            ORDER BY productId ASC`,
      {
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    const result = [];
    let tmp = null;
    let id = -1;
    sqlResult.forEach((model) => {
      if (id !== model.productId) {
        if (id !== -1) result.push(tmp);
        id = model.productId;
        tmp = {
          id,
          name: model.name,
          time: {},
        };
      }
      tmp.time[model.time] = {
        amount: model.amount,
        subtotal: model.subtotal,
      };
    });
    if (tmp) result.push(tmp);
    return result;
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
}

const db = new Database(`${process.env.NODE_ENV || 'test'}.sqlite`);
export default db;
