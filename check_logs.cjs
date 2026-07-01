const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  try {
    const response = await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    console.log('STATUS:', response.status());
  } catch (err) {
    console.error('NAV ERROR:', err.message);
  }
  
  await browser.close();
})();
