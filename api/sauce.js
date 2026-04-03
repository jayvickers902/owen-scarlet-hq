export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { ingredients } = req.body ?? {}
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: 'No ingredients provided' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API not configured' })
  }

  const list = ingredients.join(', ')

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 180,
        messages: [{
          role: 'user',
          content: `You are a fun chef helping a kid learn about cooking. A child has put these ingredients in a sauce pot: ${list}.

Write 2-3 short, enthusiastic sentences that:
1. Say what this sauce might be called or what it would taste like
2. Use simple, fun words a kid would understand
3. Say whether it sounds tasty, unusual, or surprising — be honest but encouraging

Keep it playful and educational. No markdown, no bullet points, just plain sentences.`,
        }],
      }),
    })

    if (!response.ok) {
      throw new Error(`Anthropic API returned ${response.status}`)
    }

    const data = await response.json()
    const description = data.content?.[0]?.text ?? "That's a really creative combination — only one way to find out if it works!"

    res.status(200).json({ description })
  } catch (err) {
    console.error('Sauce API error:', err)
    res.status(500).json({ error: 'Failed to get tasting notes' })
  }
}
