var a = require(process.env.SUGAR_PROJECT_REAL_ENTRY || '');

a.default.ENTRIES = process.env.SUGAR_PROJECT_ENTRIES;

export default a.default;