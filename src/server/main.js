import { promises as fs } from 'fs';

import Koa from 'koa';
import KoaLogger from 'koa-logger';
import KoaBodyParser from 'koa-bodyparser';
import KoaRouter from 'koa-router';
import KoaStatic from 'koa-static';
import KoaSession from 'koa-session';
import KoaProxy from 'koa-proxies';

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
app.use(KoaBodyParser());
app.use(KoaSession(app));

const router = new KoaRouter();

router.post('/webhook', LINEMiddleware.middleware());

router.get('/images/:image/:width', async (ctx) => {
  const path = `${__dirname}/../../public/images/${ctx.params.image}/${ctx.params.width}.png`;
  const image = await fs.readFile(path).catch(() => undefined);
  if (image) {
    ctx.response.set('Cache-Control', 'private, no-cache, no-store');
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
    ctx.redirect(`https://${Config.BASE_URL}/#/info`);
  } else {
    ctx.redirect(`https://${Config.BASE_URL}/?state=failed#/`);
  }
});

router.get('/line/logout', (ctx) => {
  delete ctx.session.lineUserId;
  ctx.redirect(`https://${Config.BASE_URL}/?state=logout#/`);
});

const apiRouter = new KoaRouter();

apiRouter.get('/', (ctx) => {
  ctx.body = true;
});

apiRouter.get('/total', async (ctx) => {
  ctx.body = (await Database.getTotal(ctx.$user.get('teamId'))).reduce((prev, next) => {
    /* eslint-disable no-param-reassign */
    prev.amount += next.amount;
    prev.ticket += next.ticket;
    prev.sum += next.subtotal;
    return prev;
  }, { ticket: 0, amount: 0, sum: 0 });
});

apiRouter.get('/info', async (ctx) => {
  ctx.body = await Database.getInfo(ctx.$user.get('teamId'),
    ctx.query.date || moment().format('YYYY-MM-DD'),
    ctx.query.startTime || '00:00', ctx.query.endTime || '23:00',
    ctx.query.minutes || 60);
});

apiRouter.get('/csv', async (ctx) => {
  ctx.body = await Database.getCSVData(ctx.$user.get('teamId'));
});

apiRouter.get('/team', async (ctx) => {
  ctx.body = await Database.getTeamData(ctx.$user.get('teamId'));
});

apiRouter.post('/team/name', async (ctx) => {
  await Database.updateOrCreateUser(ctx.$user.get('id'), ctx.request.body.name);
});

apiRouter.post('/team/product', async (ctx) => {
  const { name, price } = ctx.request.body;
  await Database.addProduct(name, price, ctx.$user.get('teamId'));
});

apiRouter.del('/team/product/:id', async (ctx) => {
  await Database.deleteProduct(ctx.params.id, ctx.$user.get('teamId'));
});

apiRouter.post('/team/order', async (ctx) => {
  const { productId, amount, ticket } = ctx.request.body;
  await Database.addOrder(productId, amount, ticket);
});

apiRouter.del('/team/order/:id', async (ctx) => {
  await Database.deleteOrder(ctx.params.id, ctx.$user.get('teamId'));
});

router.use('/api', async (ctx, next) => {
  // eslint-disable-next-line no-cond-assign
  if (ctx.session.lineUserId) {
    ctx.$user = await Database.findUser(ctx.session.lineUserId);
    if (ctx.$user) {
      ctx.status = 200;
      await next();
    } else {
      ctx.status = 412;
    }
  } else {
    ctx.status = 401;
  }
}, apiRouter.routes(), apiRouter.allowedMethods());

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
