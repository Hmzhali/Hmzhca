async function test() {
  const res = await fetch('http://localhost:3000/api/gemini/sentiment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol: 'BTC', lang: 'en' })
  });
  const text = await res.text();
  console.log('Status:', res.status, res.headers.get('content-type'));
  console.log('Body:', text);
}
test();
