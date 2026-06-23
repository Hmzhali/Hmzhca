const fs = require('fs');
console.log(fs.statSync('android/gradle/wrapper/gradle-wrapper.jar').size);
