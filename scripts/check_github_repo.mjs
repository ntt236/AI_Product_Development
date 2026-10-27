async function searchGithub(query) {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'node-fetch' }
  });
  const data = await res.json();
  if (data.items) {
    console.log(`Found ${data.total_count} repos for "${query}":`);
    for (const item of data.items.slice(0, 10)) {
      console.log(`- ${item.full_name} (${item.stargazers_count} stars): ${item.description}`);
    }
  } else {
    console.log(data);
  }
}

searchGithub('toeic').catch(console.error);
