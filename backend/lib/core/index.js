/**
 * Soul Elements — Core Library
 * 
 * Central export for all BaZi calculation modules.
 * Use this instead of directly importing individual core modules.
 */

const tst = require('./tst');
const dayun = require('./dayun');
const elements = require('./elements');

module.exports = {
  // True Solar Time
  ...tst,

  // Da Yun (Luck Cycles)
  ...dayun,

  // Element Scoring
  ...elements,
};
