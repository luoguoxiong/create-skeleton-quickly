const config = {
  isAnimation: true, // 是否使用动画
  background: '#ecf0f2', // 骨架屏主题色
  outputFilePath: './', // 输出路径，pages元素没有配置则使用这个
  init: () => {}, //开始生成之前的操作
  // 私人订制
  custom: (node, draw) => {
    // if (node.tagName.toLowerCase() === 'img') {
    // draw({
    //   width: 100,
    //   height: 8,
    //   left: 0,
    //   top: 0,
    //   zIndex: 99999999,
    //   background: '#ecf0f2',
    // });
    // return false;
    // }
  },
  // 需要生成骨架屏的网页
  pages: [
    {
      url: 'https://www.baidu.com', // 网页链接
      outputFilePath: './shell', // 输出路径
      outputFileName: 'baidu', // 输出html名称
    },
  ],
};
module.exports = config;
