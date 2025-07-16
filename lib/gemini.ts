export async function generateGeminiReply(messages: { role: string; content: string }[]) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not set');

  const contents = messages.map((m) => ({
    role: m.role === 'system' ? 'user' : m.role,
    parts: [{ text: m.content }],
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    },
  );

  const data = await res.json();
  if (!res.ok) {
    const message = data.error?.message || 'Gemini API error';
    throw new Error(message);
  }

  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  );
}