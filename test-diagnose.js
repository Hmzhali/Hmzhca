fetch('http://localhost:3000/api/binance/diagnose', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ apiKey: 'test', apiSecret: 'test' })
}).then(r => r.json()).then(console.log).catch(console.error);
