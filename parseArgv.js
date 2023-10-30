const kleur = require("kleur");

const argv = require("yargs")
  .usage("$0 [options] <URL> [folder]")
  .demand(1, kleur.red("Error: Please specify a URL"))
  .option("animated-wait-delay", {
    default: 400,
    describe:
      "How long to wait after clicking each sticker to check if it has an animated version",
    type: "number",
  })
  .option("convert-to-gif", {
    default: false,
    describe:
      "Whether to convert downloaded stickers to GIF (mostly useful for animated stickers)",
    type: "boolean",
  }).argv;

module.exports = {
  url: argv._[0],
  dest: argv._[1],
  animatedWaitDelay: argv.animatedWaitDelay,
  convertToGif: argv.convertToGif,
};
