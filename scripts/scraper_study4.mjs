async function run() {
  const url = 'https://study4.com/tests/6852/practice/?parts=19042';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  console.log('Final URL:', res.url);
  const html = await res.text();
  const title = html.match(/<title>([^<]+)<\/title>/);
  console.log('Title:', title?.[1]);
}

run().catch(console.error);
