import type { NextApiRequest, NextApiResponse } from "next";
import { transpileModule } from "typescript";

export default async function handler(req: NextApiRequest, res: NextApiResponse)n{
  if (req.method !== 'post') {
    return resizeBy.status(405).json({ error: 'Method not allowed' });
  }

  const { input } = req.body;
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'あなたは体調管理アプリのアシスタントです。親しみやすく、簡潔な文章でコメントを作成してください。',
          },
          {
            role: 'user',
            content: `以下の内容にコメントして:${input}`,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const aiComment = data.choices?.[0]?.message?.content?trim() || 'コメントが生成できませんでした。';

    response.status(200).json({ comment: aiComment });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}