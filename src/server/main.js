import { promises as fs } from 'fs';

import Koa from 'koa';
import KoaLogger from 'koa-logger';
import KoaBodyParser from 'koa-bodyparser';
import KoaRouter from 'koa-router';
import KoaStatic from 'koa-static';
import KoaSession from 'koa-session';
import KoaProxy from 'koa-proxies';
import KoaCors from '@koa/cors';

import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import { ApolloServer, gql } from 'apollo-server-koa';
import { GraphQLDateTime } from 'graphql-iso-date';

import LineLogin from 'line-login';
import chalk from 'chalk';
import debug from 'debug';
import moment from 'moment';

import Config from '../../config';
import LINEMiddleware from './LINEMiddleware';
import Database from './Database';

const mainInfoLog = debug('main:info');

const app = new Koa();
app.keys = ['will be change'];

const pathLogger = debug('main:koa');
app.use(KoaLogger(v => pathLogger(v)));
app.use(KoaCors({
  credentials: true,
}));
app.use(KoaBodyParser());
app.use(KoaSession(app));

const typeDefs = gql`
  scalar Date
  scalar Time
  scalar DateTime

  type User {
    id: Int!
    lineUserId: String!
    studentNumber: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    teams: [Team!]!
  }

  type Team {
    id: Int!
    name: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    products: [Product!]!
    order: TeamOrder!

    total: Total!
  }

  type Product {
    id: Int!
    name: String!
    price: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
    deletedAt: DateTime
    orders: [Order!]!

    timeInfo(date: Date, startTime: Time = "00:00", endTime: Time = "23:00", minutes: Int = 60): [TimeInfo!]!
  }

  type Order {
    id: Int!
    amount: Int!
    ticket: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
    productId: Int!
    product: Product!
  }

  type Total {
    sum: Int!
    amount: Int!
    ticket: Int!
  }
  
  type TimeInfo {
    time: Time!
    amount: Int!
  }
  
  type TeamOrder {
    products: [Product!]!
    orders: [Order!]!
  }

  type Result {
    success: Boolean!
    msg: String
  }

  type Query {
    user: User
    team(teamId: Int!): Team!
    teams: [Team!]!
    product(productId: Int!): Product!
    products(teamId: Int!): [Product!]!
    orders(productId: Int!): [Order!]!
  }

  type Mutation {
    updateUserTeams(teams: [String!]!): User!

    addOrder(productId: Int!, amount: Int = 1, ticket: Int = 0): Order!
    addProduct(teamId: Int!, name: String!, price: Int!): Product!

    deleteOrder(orderId: Int!): Result!
    deleteProduct(productId: Int!): Result!
  }
`;

const resolvers = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: '`YYYY-MM-DD` format string',
    serialize(value) {
      return value;
    },
    parseValue(value) {
      return value;
    },
    parseLiteral(ast) {
      return ast.kind === Kind.STRING ? ast.value : null;
    },
  }),
  Time: new GraphQLScalarType({
    name: 'Time',
    description: '`HH:mm` format string',
    serialize(value) {
      return value;
    },
    parseValue(value) {
      return value;
    },
    parseLiteral(ast) {
      return ast.kind === Kind.STRING ? ast.value : null;
    },
  }),
  DateTime: GraphQLDateTime,
  User: {
    teams(userModel) {
      return userModel.getTeams();
    },
  },
  Team: {
    products(teamModel) {
      return teamModel.getProducts();
    },
    order(teamModel) {
      return Database.getTeamOrders(teamModel.id);
    },
    async total(teamModel) {
      return (await Database.getTotal(teamModel.id)).reduce((prev, next) => {
        /* eslint-disable no-param-reassign */
        prev.ticket += next.ticket;
        prev.amount += next.amount;
        prev.sum += next.subtotal;
        return prev;
      }, { ticket: 0, amount: 0, sum: 0 });
    },
  },
  Product: {
    orders(productModel) {
      return productModel.getOrders();
    },
    timeInfo(parent, {
      date,
      startTime,
      endTime,
      minutes,
    }) {
      return Database.getInfo(parent.id, date || moment().format('YYYY-MM-DD'), startTime, endTime, minutes);
    },
  },
  Order: {
    product(orderModel) {
      return orderModel.getProduct();
    },
  },
  Query: {
    user(obj, args, ctx) {
      if (!ctx.user) throw new Error('User not found');
      return ctx.user;
    },
    team(obj, { teamId }) {
      return Database.findTeam(teamId);
    },
    teams() {
      return Database.models.team.findAll();
    },
    async product(obj, { productId }, ctx) {
      if (!ctx.user) throw new Error('User not found');
      if (!await Database.hasProduct(ctx.user.id, productId)) throw new Error('You can not get orders from teams not joined');
      return Database.findProduct(productId);
    },
    products(obj, { teamId }, ctx) {
      if (!ctx.user) throw new Error('User not found');
      if (!ctx.user.hasTeam(teamId)) throw new Error('You can not get products from teams not joined');
      return Database.findProducts(teamId);
    },
    async orders(obj, { productId }, ctx) {
      if (!ctx.user) throw new Error('User not found');
      if (!await Database.hasProduct(ctx.user.id, productId)) throw new Error('You can not get orders from teams not joined');
      return Database.models.order.findAll({ where: { productId } });
    },
  },
  Mutation: {
    async updateUserTeams(obj, { teams }, ctx) {
      if (!ctx.user) throw new Error('User not found');
      if (teams.length <= 0) throw new Error('You must join more one team');
      await Database.updateUserTeams(ctx.user.lineUserId, teams);
      return ctx.user;
    },
    async addOrder(obj, { productId, amount, ticket }, ctx) {
      if (!ctx.user) throw new Error('User not found');
      if (!await Database.hasProduct(ctx.user.id, productId)) throw new Error('You can not add order from teams not joined');
      return Database.addOrder(productId, amount, ticket);
    },
    async addProduct(obj, { teamId, name, price }, ctx) {
      if (!ctx.user) throw new Error('User not found');
      if (!await ctx.user.hasTeam(teamId)) throw new Error('You can not add product from teams not joined');
      return Database.addProduct(name, price, teamId);
    },
    async deleteOrder(obj, { orderId }, ctx) {
      if (!ctx.user) throw new Error('User not found');
      if (!await Database.hasOrder(ctx.user.id, orderId)) throw new Error('You can not delete order from teams not joined');
      await (await Database.models.order.findOne({ where: { id: orderId } })).destroy();
      return {
        success: true,
      };
    },
    async deleteProduct(obj, { productId }, ctx) {
      if (!ctx.user) throw new Error('User not found');
      if (!await Database.hasProduct(ctx.user.id, productId)) throw new Error('You can not delete product from teams not joined');
      await (await Database.models.product.findOne({ where: { id: productId } })).destroy();
      return {
        success: true,
      };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ ctx }) => {
    if (ctx.session.lineUserId) ctx.user = await Database.findUser(ctx.session.lineUserId);
    return ctx;
  },
  tracing: true,
  playground: {
    settings: {
      'editor.theme': 'light',
      'request.credentials': 'include',
    },
  },
});

server.applyMiddleware({ app, cors: false, bodyParserConfig: false });

const router = new KoaRouter();

router.post('/webhook', LINEMiddleware.middleware());

router.get('/images/:image/:width', async (ctx) => {
  const path = `${__dirname}/../../public/images/${ctx.params.image}/${ctx.params.width}.png`;
  const image = await fs.readFile(path).catch(() => undefined);
  if (image) {
    ctx.type = 'image/png';
    ctx.body = image;
  } else {
    ctx.status = 404;
  }
});

const lineLogin = new LineLogin({
  channel_id: Config.LOGIN_API.LINE_CHANNEL_ID,
  channel_secret: Config.LOGIN_API.LINE_CHANNEL_SECRET,
  callback_url: `https://${Config.BASE_URL}/line/callback`,
  prompt: 'consent',
  bot_prompt: 'aggressive',
});

router.get('/line/auth', (ctx) => {
  lineLogin.auth()(ctx, ctx);
});

router.get('/line/callback', async (ctx) => {
  const tokenResponse = await new Promise((resolve) => {
    lineLogin.callback((req, res, nextFunc, tokenRes) => {
      resolve(tokenRes);
    }, () => {
      resolve(undefined);
    })(ctx, ctx);
  });
  if (tokenResponse) {
    ctx.session.lineUserId = tokenResponse.id_token.sub;
    ctx.redirect('/#/home');
  } else {
    ctx.redirect('/?state=failed#/');
  }
});

router.get('/logout', (ctx) => {
  delete ctx.session.lineUserId;
  ctx.redirect(`https://${Config.BASE_URL}/?state=logout#/`);
});

router.post('/registration', async (ctx) => {
  ctx.session.num = LINEMiddleware.generateRegistrationCode();
  ctx.body = ctx.session.num;
  LINEMiddleware.registrationQueue[ctx.session.num] = ctx.request.body;
  ctx.status = 200;
});

router.get('/registration/wait', ctx => (new Promise((resolve) => {
  const element = LINEMiddleware.registrationQueue[ctx.session.num];
  if (element) {
    element.resolve = (lineUserId) => {
      const queueElement = LINEMiddleware.registrationQueue[ctx.session.num];
      delete ctx.session.num;
      clearTimeout(queueElement.timeout);
      ctx.session.lineUserId = lineUserId;
      ctx.redirect('/#/home');
      Database.findOrCreateUser(lineUserId, queueElement.studentNumber, queueElement.teams)
        .then(resolve);
    };
    element.timeout = setTimeout(() => {
      LINEMiddleware.registrationQueue[ctx.session.num] = undefined;
      ctx.status = 500;
      resolve();
    }, Config.REGISTRATION_CODE_WAIT);
  } else {
    ctx.status = 500;
    resolve();
  }
})));

app.use(router.routes());
app.use(router.allowedMethods());

if (process.env.NODE_ENV !== 'production') {
  app.use(KoaProxy('/', {
    target: 'http://localhost:8081',
  }));
  app.use(KoaStatic('./frontend/public'));
} else {
  app.use(KoaStatic('../dist'));
}

app.use(KoaStatic('./public'));

const port = process.env.PORT || 8080;
Database.authenticate()
  .then(async () => {
    app.listen(port);
    mainInfoLog(chalk`{red listen} {underline.blue localhost:${port}}`);
  });
