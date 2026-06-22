import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
       console.log('PAGE LOG (' + msg.type() + '):', msg.text());
       const args = msg.args();
       for (const arg of args) {
         console.log('Arg:', arg._preview);
       }
    }
  });

  page.on('pageerror', err => {
    console.log('PAGE UNCAUGHT ERROR:', err.message, '\n', err.stack);
  });

  console.log('Navigating...');
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'load' });
  
  console.log('Waiting for errors...');
  await page.waitForTimeout(5000);
  console.log('Done.');

  await browser.close();
})();
