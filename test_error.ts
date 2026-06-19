import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => {
    console.log('PAGE LOG (' + msg.type() + '):', msg.text());
  });

  page.on('pageerror', err => {
    console.log('PAGE UNCAUGHT ERROR:', err.message, '\n', err.stack);
  });

  console.log('Navigating...');
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
  
  console.log('Waiting for networkidle...');
  await page.waitForTimeout(5000);
  console.log('Done.');

  await browser.close();
})();
