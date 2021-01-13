#!/usr/bin/env node

const program = require('commander');
const path = require('path');
const fs = require('fs');
const pkg = require('../package.json');
const conf = require('./config');
const DrawPageskeleton = require('../src');
const utils = require('../src/utils');
const run = require('../server');
const currDir = process.cwd();

function getConfig() {
  const confFile = path.resolve(currDir, conf.filename);
  if (!fs.existsSync(confFile)) {
    return utils.log.error(`please run 'csq init' to initialize a config file`, 1);
  }
  return require(confFile);
}
program
  .version(pkg.version)
  .usage('<command> [options]')
  .option('-v, --version', 'latest version')
  .option('-tar, --target <tar>', 'same to the config of url@rootNode.');

program
  .command('run [port]')
  .description('run a create-skeleton server')
  .action(function (port) {
    run(port || 6666);
  });

program
  .command('init')
  .description('create a default skeleton.config.js file')
  .action(function (env, options) {
    const confFile = path.resolve(currDir, conf.filename);
    if (fs.existsSync(confFile)) {
      return console.log(
        `\n[${conf.filename}] had been created! you can edit it and then run 'csq start'\n`,
      );
    }
    fs.writeFile(path.resolve(currDir, conf.filename), conf.getTemplate(), (err) => {
      if (err) throw err;
      console.log(
        `\n[${conf.filename}] had been created! now, you can edit it and then run 'csq start'\n`,
      );
    });
  });

program
  .command('start')
  .description('start create a skeleton')
  .action(function () {
    new DrawPageskeleton(getConfig()).start();
  });

program.parse(process.argv);
if (program.args.length < 1) program.help();
