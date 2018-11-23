import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import { ApolloServer, gql } from 'apollo-server-koa';
import { GraphQLDateTime } from 'graphql-iso-date';
import moment from 'moment';

import Database from './Database';

class GraphQL {
  static get typeDefs() {
    return gql`
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

      type Token {
        token: String!
        expiredAt: DateTime!
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

        userToken: Token!
      }
    `;
  }

  static get scalarTypes() {
    return {
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
    };
  }

  static get typeFields() {
    return {
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
    };
  }

  static get Query() {
    return {
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
    };
  }

  static get Mutation() {
    return {
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
      userToken(obj, args, ctx) {
        return Database.findOrCreateTemporaryToken(ctx.user.id);
      },
    };
  }

  applyMiddleware(app) {
    if (!this.server) {
      this.server = new ApolloServer({
        typeDefs: GraphQL.typeDefs,
        resolvers: {
          ...GraphQL.scalarTypes,
          ...GraphQL.typeFields,
          Query: GraphQL.Query,
          Mutation: GraphQL.Mutation,
        },
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
    }
    this.server.applyMiddleware({ app, cors: false, bodyParserConfig: false });
  }
}

export default new GraphQL();
