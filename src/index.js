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
      custom: (node, draw) => {},
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
    this.options.init = this.options.init || function () {};
    this.options.custom = this.options.custom || function () {};
    this.options.custoutputFilePathm = this.options.outputFilePath || '';
    this.options.background = this.options.background || '#ecf0f2';
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
    return works;
  }

  beginWork({ url, outputFilePath, outputFileName }) {
    return new Promise(async (res) => {
      if (!url) {
        log.warn(`缺少url!`);
        res({ isComplete: false });
        return;
      }
      log.info(`${url}正在生成骨架屏...`);
      const page = await this.browser.openPage(url);
      let html = await this.generateSkeletonHTML(page);
      if (this.options.isAnimation) {
        html = `<style>@keyframes opacity{0%{opacity:1} 50%{opacity:.5} 100%{opacity:1}}</style> ${html}`;
      }
      let filepath = outputFilePath || this.options.outputFilePath;
      if (!filepath) {
        res({ isComplete: true, html, url, outputFilePath: '', outputFileName });
      } else {
        if (!outputFileName) {
          log.warn(`${url}缺少outputFileName!`);
          res({ isComplete: false });
          return;
        }
        try {
          fs.readdirSync(filepath);
        } catch (e) {
          fs.mkdirSync(filepath);
        }
        fs.writeFileSync(`${filepath}/${outputFileName}.html`, html);
        res({ isComplete: true, html, url, outputFilePath: filepath, outputFileName });
      }
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
