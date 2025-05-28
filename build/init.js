const fs = require('node:fs');
const { dist } = require('./config');

// ensure dist exist
if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist);
} else {
  fs.rm(dist, {
    recursive: true,
    force: true
  }, () => {
    fs.mkdirSync(dist);
    console.log(`Restored new source directory: ${dist}`)
  })
  console.log(`Cleared all old compiled source under ${dist}`)
}
