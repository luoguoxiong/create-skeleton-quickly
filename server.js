const Koa = require('koa');
const path = require('path');
const koaStatic = require('koa-static');
const Router = require('koa-router');
const chalk = require('chalk');
let open = require('open');
const DrawPageskeleton = require('./src');

function run(port) {
  const app = new Koa();
  const router = new Router();
  app.use(koaStatic(path.join(__dirname, './dist')));

  router.get('/view', async (ctx) => {
    const { url, isAnimation, background, device } = ctx.request.query;
    const [data] = await new DrawPageskeleton({
      isAnimation: isAnimation === '1', // 是否使用动画
      background, // 骨架屏主题色
      device: device || 'mobile',
      pages: [
        {
          url,
        },
      ],
    }).start();
    const html = data && data.isComplete ? data.html : '';
    ctx.body = {
      html,
    };
  });

  app.use(router.routes()).use(router.allowedMethods());

  app.listen(port, () => {
    console.log(chalk.green(`server is running at http://localhost:${port}`));
    open(`http://localhost:${port}`, 'chrmoe');
  });
}
module.exports = run;
