import { execSync } from 'child_process';
import { chmodSync } from 'fs';
try {
  chmodSync('./android/gradlew', 0o755);
  const output = execSync('./gradlew signingReport', { cwd: './android' }).toString();
  console.log(output);
} catch (e) {
  console.error(e.message);
}
