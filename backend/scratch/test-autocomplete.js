require('dotenv').config()
const axios = require('axios')
const GROQ_API_KEY = process.env.GROQ_API_KEY

function dedup(raw) {
  const seen = new Set()
  return raw
    .filter((item) => {
      const key = `${(item.name || item.city || '').toLowerCase()}-${(item.country || '').toLowerCase()}`
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 7)
    .map((item, i) => ({
      id: item.id || `ai_${i}`,
      name: item.name || item.city || '',
      city: item.city || item.name || '',
      country: item.country || '',
      state: item.state || '',
    }))
}

async function testQuery(query) {
  const groqRes = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are a precise city autocomplete API. Rules: (1) Return ONLY real cities, towns, or administrative regions — NO airports, landmarks, parks, theme parks, or fictional places. (2) Only include a city in a country if it genuinely exists there. (3) Return a raw JSON array with no explanation, markdown, or code fences.',
        },
        {
          role: 'user',
          content: `List up to 7 real cities or regions whose name starts with or closely matches "${query}". Prioritize the most globally popular travel destinations first. Return a JSON array: [{"id":"1","name":"City Name","city":"City Name","country":"Country Name","state":"State or Region"}]. No airports, no landmarks, no made-up locations.`,
        },
      ],
      temperature: 0.1,
      max_tokens: 500,
    },
    { headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 8000 }
  )
  const content = groqRes.data?.choices?.[0]?.message?.content || ''
  const match = content.match(/\[[\s\S]*?\]/)
  const locs = match ? dedup(JSON.parse(match[0])) : []
  console.log(`\n"${query}" → ${locs.length} results:`)
  locs.forEach(l => console.log(`  📍 ${l.name}, ${l.country}${l.state ? ` (${l.state})` : ''}`))
}

;(async () => {
  await testQuery('mum')
  await testQuery('ban')
  await testQuery('goa')
  await testQuery('lon')
  await testQuery('tok')
  await testQuery('new yor')
  await testQuery('del')
})()
