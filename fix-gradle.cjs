const https = require('https');
const fs = require('fs');

const url = 'https://raw.githubusercontent.com/ionic-team/capacitor/main/android/template/gradle/wrapper/gradle-wrapper.jar';
const dest = './android/gradle/wrapper/gradle-wrapper.jar';

const file = fs.createWriteStream(dest);
https.get(url, function(response) {
  response.pipe(file);
  file.on('finish', function() {
    file.close();  // close() is async, call cb after close completes.
    console.log('Downloaded fresh gradle-wrapper.jar');
  });
}).on('error', function(err) {
  fs.unlink(dest, () => {});
  console.error('Error downloading:', err.message);
});
