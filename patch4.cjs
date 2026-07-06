const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  `    } catch (err: any) {
      console.warn("Failed to dispatch automated whale-triggered futures trade:", err.message || err);
    }`,
  `    } catch (err: any) {
      console.warn("Failed to dispatch automated whale-triggered futures trade:", err.message || err);
      failedCoinsCooldownRef.current[signal.symbol] = Date.now();
    }`
);

fs.writeFileSync('src/App.tsx', content);
