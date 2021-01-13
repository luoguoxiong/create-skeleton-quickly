const chalk = require('chalk');

const appName = 'skeleton';

const genArgs = {
  // {name: {type, value}}
  // appName-name-type:value
  prefixName: `${appName}-`,
  create(args) {
    if (getAgrType(args) !== 'object') return;
    return Object.keys(args).map((item) => {
      const { type, value } = args[item];
      return `${this.prefixName + item}-${type}:${value}`;
    });
  },
};

function log() {
  console.log.apply(console, arguments);
}

log.error = function (msg) {
  log(chalk.red(msg));
};

log.warn = function (msg) {
  log(chalk.yellow(msg));
};

log.info = function (msg) {
  log(chalk.greenBright(msg));
};

function getAgrType(agr) {
  return Object.prototype.toString.call(agr).split(/\s/)[1].slice(0, -1).toLowerCase();
}

exports.log = log;
exports.genArgs = genArgs;
