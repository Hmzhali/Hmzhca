const fs = require('fs');
const https = require('https');

const url = 'https://raw.githubusercontent.com/gradle/gradle/v8.2.1/gradle/wrapper/gradle-wrapper.jar';
const dest = 'android/gradle/wrapper/gradle-wrapper.jar';

const file = fs.createWriteStream(dest);
https.get(url, function(response) {
  response.pipe(file);
  file.on('finish', function() {
    file.close(() => {
      console.log('Downloaded fresh gradle-wrapper.jar');
    });
  });
}).on('error', function(err) {
  fs.unlink(dest, () => {});
  console.error('Error downloading:', err.message);
});
