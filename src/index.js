const fs = require('fs');
const ppteer = require('./pp');
const evalScripts = require('../evalDOM');
const { log, genArgs } = require('./utils');

class DrawPageStructure {
  constructor(
    options = {
      isAnimation: true, // 是否使用动画
      background: '#ecf0f2', // 骨架屏主题色
      outputFilePath: '', // 输出路径，pages元素没有配置则使用这个
      init: () => {},
      // 私人订制
      custom: (node, draw) => {
        return false;
      },
      device: 'mobile' || 'ipad' || 'pc',
      // 需要生成骨架屏的网页
      pages: [
        {
          url: 'https://www.baidu.com/', // 网页链接
          outputFilePath: './', // 输出路径
          outputFileName: 'baidu', // 输出html名称
        },
      ],
    },
  ) {
    this.options = options;
    this.browser = null;
  }

  async start() {
    const { device, pages } = this.options;

    log.info('启动浏览器...');
    this.browser = await ppteer({
      device: device,
    });
    const works = [];
    for (let i = 0; i < pages.length; i++) {
      const item = pages[i];
      const work = await this.beginWork(item);
      works.push(work);
    }
    log.info('任务执行完毕！');
    await this.browser.browser.close();
    return works.filter((item) => item.isComplete);
  }

  beginWork({ url, outputFilePath, outputFileName }) {
    return new Promise(async (res) => {
      if (!url) {
        log.warn(`缺少url!`);
        res({ isComplete: false });
        return;
      }
      if (!(outputFilePath || this.options.outputFilePath)) {
        log.warn(`${url}缺少outputFilePath!`);
        res({ isComplete: false });
        return;
      }
      if (!outputFileName) {
        log.warn(`${url}缺少outputFileName!`);
        res({ isComplete: false });
        return;
      }
      log.info(`${url}正在生成骨架屏...`);
      const page = await this.browser.openPage(url);
      let html = await this.generateSkeletonHTML(page);
      if (this.options.isAnimation) {
        html = `<style>@keyframes opacity{0%{opacity:1} 50%{opacity:.5} 100%{opacity:1}}</style> ${html}`;
      }
      try {
        fs.readdirSync(outputFilePath);
      } catch (e) {
        fs.mkdirSync(outputFilePath);
      }
      fs.writeFileSync(`${outputFilePath}/${outputFileName}.html`, html);
      res({ isComplete: true, html, url, outputFilePath, outputFileName });
    });
  }

  async generateSkeletonHTML(page) {
    const { custom, background, init, isAnimation } = this.options;
    let html = '';
    try {
      const agrs = genArgs.create({
        init: {
          type: 'function',
          value: init.toString(),
        },
        includeElement: {
          type: 'function',
          value: custom.toString(),
        },
        background: {
          type: 'string',
          value: background,
        },
        header: {
          type: 'object',
          value: JSON.stringify(''),
        },
        animation: {
          type: 'string',
          value: isAnimation ? 'opacity 1s linear infinite;' : '',
        },
      });
      agrs.unshift(evalScripts);
      html = await page.evaluate.apply(page, agrs);
    } catch (e) {
      log.error('\n[page.evaluate] ' + e.message);
    }
    return html;
  }
}

module.exports = DrawPageStructure;
