import { promises as fs } from 'fs';
import crypto from 'crypto';

import Koa from 'koa';
import KoaLogger from 'koa-logger';
import KoaBodyParser from 'koa-bodyparser';
import KoaRouter from 'koa-router';
import KoaStatic from 'koa-static';
import KoaSession from 'koa-session';
import KoaProxy from 'koa-proxies';
import KoaCors from '@koa/cors';

import LineLogin from 'line-login';
import chalk from 'chalk';
import debug from 'debug';
import moment from 'moment';

import Config from '../../config';
import LINEMiddleware from './LINEMiddleware';
import Database from './Database';
import GraphQL from './GraphQL';

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
GraphQL.applyMiddleware(app);

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
  ctx.status = 200;
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

router.post('/token/auth', async (ctx) => {
  const tempToken = Database.tempToken.user[ctx.request.body.token];
  if (tempToken) {
    const token = crypto.createHash('sha256').update(`${tempToken.userId}_${tempToken.token}`).digest('hex');
    await Database.models.token.create({
      temporaryToken: tempToken.token,
      token,
      expiredAt: moment().add(Config.TOKEN_EXPIRE_DAYS, 'days').toDate(),
      userId: tempToken.userId,
    });
    ctx.status = 200;
    ctx.body = token;
  } else {
    ctx.status = 400;
  }
});

router.post('/token/login', async (ctx) => {
  const { tempToken, token } = ctx.request.body;
  const tokenModel = await Database.models.token.findOne({
    where: {
      temporaryToken: tempToken,
      token,
    },
  });
  if (tokenModel) {
    ctx.session.lineUserId = (await tokenModel.getUser()).lineUserId;
    ctx.status = 200;
  } else {
    ctx.status = 400;
  }
});

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
