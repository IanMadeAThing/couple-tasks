export async function parseTaskWithAI(transcript) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [{
        role: "user",
        content: `You are a task parser for a couples todo app. 
        
Given this voice note or text: "${transcript}"

Respond with ONLY a JSON object like this, no other text:
{
  "text": "clean task description",
  "section": "now" or "later" or "tomorrow"
}

Rules for section:
- "now" = urgent, needs to happen today, immediately
- "later" = sometime soon but not urgent  
- "tomorrow" = explicitly tomorrow or can wait until tomorrow`
      }]
    })
  });

  const data = await response.json();
  const raw = data.content[0].text;
  const parsed = JSON.parse(raw);
  return parsed;
}