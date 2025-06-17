import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from '@langchain/core/messages'
import { TextEncoder } from 'util'

const getType = (message: BaseMessage) => {
  let role: 'user' | 'system' | 'assistant' | 'tool' | 'complete' | 'done'

  if (message instanceof SystemMessage) role = 'system'
  else if (message?.kwargs?.tool_call_id) role = 'tool'
  else if (message instanceof HumanMessage) role = 'user'
  else if (message instanceof AIMessage) role = 'assistant'
  else role = 'user'
  return role
}

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

              const jsonResponse = JSON.stringify({
                content,
                type: getType(content),
              })
              controller.enqueue(this.encoder.encode(`data: ${jsonResponse}\n\n`))

              this.config.onChunk?.(content)
            }
          }

          this.config.onComplete?.(messages)
          controller.enqueue(
            this.encoder.encode(`data: ${JSON.stringify({ agent: { type: 'Done' } })}`),
          )
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
