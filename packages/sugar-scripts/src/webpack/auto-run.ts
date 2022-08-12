var app = require(process.env.SUGAR_PROJECT_REAL_ENTRY || '');

const entries: any = process.env.SUGAR_PROJECT_ENTRIES || {};
app.default.ENTRIES = entries;

console.log('auto run', app.default.name)
console.table(
  Object.keys(entries).map((entryKey) => ({
    entry: entryKey,
    count: entries[entryKey].length,
    files: entries[entryKey]
  }))
)
new app.default();