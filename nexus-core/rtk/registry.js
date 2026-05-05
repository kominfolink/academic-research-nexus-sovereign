const { FILTERS } = require("./constants.js");
const { gitDiff } = require("./filters/gitDiff.js");
const { gitStatus } = require("./filters/gitStatus.js");
const { grep } = require("./filters/grep.js");
const { find } = require("./filters/find.js");
const { dedupLog } = require("./filters/dedupLog.js");
const { ls } = require("./filters/ls.js");
const { tree } = require("./filters/tree.js");
const { smartTruncate } = require("./filters/smartTruncate.js");
const { readNumbered } = require("./filters/readNumbered.js");
const { searchList } = require("./filters/searchList.js");

const REGISTRY = {
  [FILTERS.GIT_DIFF]: gitDiff,
  [FILTERS.GIT_STATUS]: gitStatus,
  [FILTERS.GREP]: grep,
  [FILTERS.FIND]: find,
  [FILTERS.DEDUP_LOG]: dedupLog,
  [FILTERS.LS]: ls,
  [FILTERS.TREE]: tree,
  [FILTERS.SMART_TRUNCATE]: smartTruncate,
  [FILTERS.READ_NUMBERED]: readNumbered,
  [FILTERS.SEARCH_LIST]: searchList
};

// Rust resolve_filter aliases (pipe_cmd.rs): grep|rg, find|fd
const ALIASES = {
  rg: grep,
  fd: find
};

function resolveFilter(name) {
  return REGISTRY[name] || ALIASES[name] || null;
}

function allFilters() {
  return REGISTRY;
}

module.exports = { resolveFilter, allFilters };
