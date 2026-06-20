const { execSync } = require('child_process');
const fs = require('fs');
try {
  execSync('tar -xzf node_modules/@capacitor/cli/assets/android-template.tar.gz gradle/wrapper/gradle-wrapper.jar');
  fs.copyFileSync('gradle/wrapper/gradle-wrapper.jar', 'android/gradle/wrapper/gradle-wrapper.jar');
  console.log('Copied, new size:', fs.statSync('android/gradle/wrapper/gradle-wrapper.jar').size);
  execSync('rm -rf gradle');
} catch(e) {
  console.error(e.message);
}
