import type { Message } from './chat'

const API_URL = import.meta.env.VITE_AI_API_URL
const API_KEY = import.meta.env.VITE_AI_API_KEY

export class AiService {
  static async generateResponse(
    message: string,
    chatHistory: Message[],
    onStream: (text: string) => void,
  ): Promise<void> {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'glm-4-flash-250414',
          messages: [
            ...chatHistory.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            { role: 'user', content: message },
          ],
          stream: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Response body is null')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim()
          if (!line) continue

          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') return

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices[0]?.delta?.content || ''
              if (content) onStream(content)
            } catch (e) {
              console.error('Error parsing SSE message:', e)
            }
          }
        }

        buffer = lines[lines.length - 1]
      }
    } catch (error) {
      console.error('AI API Error:', error)
      throw error
    }
  }
}
