fetch('https://ais-dev-u7un6hh2e475uaiehqhwxn-395727155540.europe-west2.run.app/api/binance/diagnose', {
  method: 'POST',
  headers: {
    'Content-Type': 'text/plain'
  },
  body: JSON.stringify({ apiKey: 'test', apiSecret: 'test' })
}).then(async r => {
  console.log('Status:', r.status);
  console.log('CORS Header:', r.headers.get('Access-Control-Allow-Origin'));
  console.log('Body:', await r.text());
}).catch(console.error);
