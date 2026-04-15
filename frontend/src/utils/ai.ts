const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

export async function callOpenRouter(prompt: string, temperature: number = 0.5): Promise<string> {
  const apiKey = localStorage.getItem('openrouter_api_key')
  
  if (!apiKey) {
    throw new Error('OpenRouter API key not set')
  }

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.href,
      'X-Title': 'Resume Tailor',
    },
    body: JSON.stringify({
      model: 'nvidia/nemotron-3-super-120b-a12b:free',
      messages: [{ role: 'user', content: prompt }],
      temperature,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error?.message || `API request failed: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}
