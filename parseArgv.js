const chalk = require("chalk");

const argv = require("yargs")
  .usage("$0 [options] <URL> [folder]")
  .demand(1, chalk.red("Error: Please specify a URL"))
  .option("animated-wait-delay", {
    default: 400,
    describe:
      "How long to wait after clicking each sticker to check if it has an animated version",
    type: "number",
  }).argv;

module.exports = {
  url: argv._[0],
  dest: argv._[1],
  animatedWaitDelay: argv.animatedWaitDelay,
};
