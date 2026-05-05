// RTK port constants (mirror Rust defaults)
const RAW_CAP = 10 * 1024 * 1024;      // 10 MiB
const MIN_COMPRESS_SIZE = 500;          // bytes; skip tiny blobs
const DETECT_WINDOW = 1024;             // autodetect peeks first N chars
const GIT_DIFF_HUNK_MAX_LINES = 100;    // per-hunk line cap
const GIT_DIFF_CONTEXT_KEEP = 3;        // context lines around changes
const DEDUP_LINE_MAX = 2000;            // dedupLog truncation cap

// Rust pipe_cmd.rs parity caps
const GREP_PER_FILE_MAX = 10;           // match rust: matches.iter().take(10)
const FIND_PER_DIR_MAX = 10;            // match rust: files.iter().take(10)
const FIND_TOTAL_DIR_MAX = 20;          // match rust: dirs.iter().take(20)

// git status caps (rust config::limits())
const STATUS_MAX_FILES = 10;            // config::limits().status_max_files
const STATUS_MAX_UNTRACKED = 10;        // config::limits().status_max_untracked

// ls compact_ls (rtk/src/cmds/system/ls.rs)
const LS_EXT_SUMMARY_TOP = 5;           // top-N extensions in summary
const LS_NOISE_DIRS = [
  "node_modules", ".git", "target", "__pycache__",
  ".next", "dist", "build", ".venv", "venv",
  ".cache", ".idea", ".vscode", ".DS_Store"
];

// tree filter_tree_output cap (no rust cap, we add one to be safe)
const TREE_MAX_LINES = 200;

// Cursor Glob "Result of search in '...' (total N files):" list
const SEARCH_LIST_PER_DIR_MAX = 10;
const SEARCH_LIST_TOTAL_DIR_MAX = 20;

// Smart truncate (port of filter.rs smart_truncate fallback)
const SMART_TRUNCATE_HEAD = 120;        // lines kept from top
const SMART_TRUNCATE_TAIL = 60;         // lines kept from bottom
const SMART_TRUNCATE_MIN_LINES = 250;   // only kick in above this

// readNumbered (files with "  N|content" lines, e.g. Cursor read_file)
const READ_NUMBERED_MIN_HIT_RATIO = 0.7;

// Filter name strings (Rust parity + JS extras)
const FILTERS = {
  GIT_DIFF: "git-diff",
  GIT_STATUS: "git-status",
  GIT_LOG: "git-log",
  GREP: "grep",
  FIND: "find",
  LS: "ls",
  TREE: "tree",
  DEDUP_LOG: "dedup-log",
  SMART_TRUNCATE: "smart-truncate",
  READ_NUMBERED: "read-numbered",
  SEARCH_LIST: "search-list"
};

module.exports = { RAW_CAP, MIN_COMPRESS_SIZE, DETECT_WINDOW, GIT_DIFF_HUNK_MAX_LINES, GIT_DIFF_CONTEXT_KEEP, DEDUP_LINE_MAX, GREP_PER_FILE_MAX, FIND_PER_DIR_MAX, FIND_TOTAL_DIR_MAX, STATUS_MAX_FILES, STATUS_MAX_UNTRACKED, LS_EXT_SUMMARY_TOP, LS_NOISE_DIRS, TREE_MAX_LINES, SEARCH_LIST_PER_DIR_MAX, SEARCH_LIST_TOTAL_DIR_MAX, SMART_TRUNCATE_HEAD, SMART_TRUNCATE_TAIL, SMART_TRUNCATE_MIN_LINES, READ_NUMBERED_MIN_HIT_RATIO, FILTERS };
