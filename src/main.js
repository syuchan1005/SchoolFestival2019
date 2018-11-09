import { promises as fs } from 'fs';

import Koa from 'koa';
import KoaLogger from 'koa-logger';
import KoaBodyParser from 'koa-bodyparser';
import KoaRouter from 'koa-router';
import KoaStatic from 'koa-static';

import chalk from 'chalk';
import debug from 'debug';

import LINEMiddleware from './LINEMiddleware';
import Database from './Database';

const mainInfoLog = debug('main:info');

const app = new Koa();
const pathLogger = debug('main:koa');
app.use(KoaLogger(v => pathLogger(v)));
app.use(KoaBodyParser());

const router = new KoaRouter();

router.post('/webhook', LINEMiddleware.middleware());

router.get('/images/:image/:width', async (ctx) => {
  const path = `${__dirname}/../public/images/${ctx.params.image}/${ctx.params.width}.png`;
  const image = await fs.readFile(path).catch(() => undefined);
  if (image) {
    ctx.response.set('Cache-Control', 'private, no-cache, no-store');
    ctx.type = 'image/png';
    ctx.body = image;
  } else {
    ctx.status = 404;
  }
});

app.use(router.routes());
app.use(router.allowedMethods());
app.use(KoaStatic('./public'));

const port = process.env.PORT || 8080;
Database.authenticate()
  .then(async () => {
    app.listen(port);
    mainInfoLog(chalk`{red listen} {underline.blue localhost:${port}}`);
  });
