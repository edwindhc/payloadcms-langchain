import { BaseMessage } from '@langchain/core/messages'
import { TextEncoder } from 'util'

interface StreamConfig {
  onChunk?: (content: BaseMessage) => void
  onComplete?: (messages: BaseMessage[]) => void
  onError?: (error: unknown) => void
}

type StreamResponse = AsyncGenerator<
  {
    messages: BaseMessage[]
  },
  void,
  unknown
>

export class StreamService {
  private encoder: TextEncoder
  private config: StreamConfig

  constructor(config: StreamConfig = {}) {
    this.encoder = new TextEncoder()
    this.config = config
  }

  createReadableStream(stream: StreamResponse) {
    return new ReadableStream({
      start: async (controller) => {
        try {
          let messages: BaseMessage[] = []

          for await (const chunk of stream) {
            if (chunk.messages?.[chunk.messages.length - 1]?.content) {
              const content = chunk.messages[chunk.messages.length - 1]
              messages = chunk.messages

              const jsonResponse = JSON.stringify({ content })
              controller.enqueue(this.encoder.encode(`data: ${jsonResponse}\n\n`))

              this.config.onChunk?.(content)
            }
          }

          this.config.onComplete?.(messages)
          controller.close()
        } catch (error) {
          this.config.onError?.(error)
          controller.error(error)
        }
      },
    })
  }

  createResponse(stream: StreamResponse) {
    const readableStream = this.createReadableStream(stream)

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  }
}
