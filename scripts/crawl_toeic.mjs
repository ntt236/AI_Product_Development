async function main() {
  const url = 'https://tienganhmoingay.com/de-thi-toeic/thi-thu-toeic-online/ma-de-decade/';
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const html = await res.text();
  console.log(html.slice(10000));
}

main().catch(console.error);
