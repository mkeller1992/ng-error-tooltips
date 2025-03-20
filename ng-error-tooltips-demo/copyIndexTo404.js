const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'dist', 'ng-error-tooltips-demo', 'browser', 'index.html');
const destPath = path.join(__dirname, 'dist', 'ng-error-tooltips-demo','browser', '404.html');

fs.copyFile(srcPath, destPath, (err) => {
  if (err) throw err;
  console.log('index.html was copied to 404.html');
});
