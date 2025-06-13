import { APIError, PayloadRequest } from 'payload'
import { OpenAIModel } from '../langchain/models/OpenAIModel'
import { AgentFactory } from '../langchain/factory/AgentFactory'
import { ConversationMemory } from '../langchain/memory/ConversationMemory'
import { generateTools } from '../langchain/tools'
import { Tool } from '@langchain/core/tools'
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from '@langchain/core/messages'
import { StreamService } from '../services/StreamService'

function processText(text: string) {
  return text.replace(/\\n/g, '\n').replace(/\s+\n/g, '\n').trim()
}

function baseMessageToRoleContent(message: BaseMessage): {
  role: 'user' | 'system' | 'assistant' | 'tool'
  content: string
} {
  let role: 'user' | 'system' | 'assistant' | 'tool'

  if (message instanceof SystemMessage) role = 'system'
  else if (message instanceof HumanMessage) role = 'user'
  else if (message instanceof AIMessage) role = 'assistant'
  else if (message instanceof ToolMessage) role = 'tool'
  else role = 'user'

  return { role, content: processText(message.lc_kwargs.content) }
}

export const generateTitle = (input: string) => {
  return input.slice(0, 50) + (input.length > 50 ? '...' : '')
}

export const startConversation = async (req: PayloadRequest) => {
  try {
    let data: { [key: string]: string } = {}
    if (typeof req.json === 'function') {
      data = await req.json()
    }
    const { message } = data

    const openAIModel = new OpenAIModel()
    const agent = AgentFactory.createAgent(openAIModel, generateTools(req))
    const memory = new ConversationMemory(openAIModel.getModel())
    await memory.addMessage(message, 'user')

    const stream = await agent.stream({
      messages: [
        // TODO: Add context to the system message dynamically
        new SystemMessage(
          'Eres un asistente de gestion de proyectos, tienes acceso a herramientas para gestionar proyectos, usuarios, tareas, etc.',
        ),
        new HumanMessage(message),
      ],
    })

    const streamService = new StreamService({
      onComplete: async (messages) => {
        const transformedMessage = messages
          .filter((message) => message.lc_kwargs.content)
          .map(baseMessageToRoleContent)

        const conversation = await req.payload
          .create({
            collection: 'conversations',
            data: {
              proyecto: 1, // TODO: Add tenant id
              title: generateTitle(transformedMessage[1].content),
              messages: transformedMessage,
            },
          })
          .catch((error) => {
            throw new APIError(error.data.errors, 400, null, true)
          })

        const finalResponse = JSON.stringify({
          type: 'conversation_created',
          conversationId: conversation?.id,
        })

        console.log(finalResponse, ' finalResponse')
      },
    })

    return streamService.createResponse(stream)
  } catch (_) {
    throw new APIError('Error starting conversation', 400, null, true)
  }
}

export const chatConversation = async (req: PayloadRequest) => {
  try {
    let data: { [key: string]: string } = {}

    if (typeof req.json === 'function') {
      data = await req.json()
    }
    const { id } = req.routeParams as { id: string }
    const { message } = data

    const conversation = await req.payload.findByID({
      collection: 'conversations',
      id,
    })

    if (!conversation) {
      throw new APIError('Conversation not found', 400, null, true)
    }

    const openAIModel = new OpenAIModel()
    const tools: Tool[] = []
    const agent = AgentFactory.createAgent(openAIModel, tools)

    const result = await agent.stream({
      messages: [
        ...(conversation.messages || []).map((msg) => {
          if (msg.role === 'user') return new HumanMessage(msg.content)
          if (msg.role === 'assistant') return new AIMessage(msg.content)
          if (msg.role === 'system') return new SystemMessage(msg.content)
          if (msg.role === 'tool')
            return new ToolMessage({
              content: msg.content,
              tool_call_id: msg.id || 'default',
            })
          return new HumanMessage(msg.content)
        }),
        new HumanMessage(message),
      ],
    })

    const streamService = new StreamService({
      onComplete: async (messages) => {
        let fullResponse = ''
        for (const msg of messages) {
          if (msg.lc_kwargs.content) {
            fullResponse += msg.lc_kwargs.content
          }
        }

        await req.payload.update({
          collection: 'conversations',
          id,
          data: {
            messages: [
              ...(conversation.messages || []),
              { role: 'user', content: message },
              { role: 'assistant', content: fullResponse },
            ],
          },
        })
      },
    })

    return streamService.createResponse(result)
  } catch (_) {
    throw new APIError('Conversation not found', 400, null, true)
  }
}
