#!/usr/bin/env node

const config = require("./parseArgv");
const downloadStickers = require("./index");

downloadStickers(config);
