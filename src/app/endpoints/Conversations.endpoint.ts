import { APIError, PayloadRequest } from 'payload'
import { OpenAIModel } from '../langchain/models/OpenAIModel'
import { AgentFactory } from '../langchain/factory/AgentFactory'
import { ConversationMemory } from '../langchain/memory/ConversationMemory'
import { generateTools } from '../langchain/tools'
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

    const systemMessage = `Eres un asistente de gestion de proyectos, tienes acceso a herramientas para gestionar proyectos, usuarios, tareas, etc.
      El flujo es el siguiente:
      - El usuario te pide crear un repositorio en GitHub
      - Tu creas un repositorio en GitHub
      - El usuario te pide crear un bucket en AWS
      - Tu creas un bucket en AWS
      - El usuario te pide crear un workflow en GitHub
      - Tu creas un workflow en GitHub
      El workflow debe tener los siguientes pasos:
      - Instalar dependencias
      - Build del proyecto
      - Deploy del proyecto y subirlo a S3
      `
    await memory.addMessage(systemMessage, 'system')
    await memory.addMessage(message, 'user')

    // Verificar que la memoria tenga el contexto necesario
    const context = await memory.getContext()

    const stream = await agent.stream({
      messages: context.chat_history,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error en startConversation:', error)
    throw new APIError(error?.message || 'Error starting conversation', 400, null, true)
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
    const agent = AgentFactory.createAgent(openAIModel, generateTools(req))
    const memory = new ConversationMemory(openAIModel.getModel())

    for (const msg of conversation.messages || []) {
      if (msg.role !== 'tool') {
        await memory.addMessage(msg.content, msg.role)
      }
    }
    await memory.addMessage(message, 'user')

    const { chat_history: messages } = await memory.getContext()

    const stream = await agent.stream({
      messages,
    })

    const streamService = new StreamService({
      onComplete: async (messages) => {
        const transformedMessage = messages
          .filter((message) => message.lc_kwargs.content)
          .map(baseMessageToRoleContent)

        await req.payload.update({
          collection: 'conversations',
          id,
          data: {
            messages: [
              ...(conversation.messages || []),
              { role: 'user', content: message },
              ...transformedMessage.slice(-1), // Solo agregamos el último mensaje del asistente
            ],
          },
        })
      },
    })

    return streamService.createResponse(stream)
  } catch (error: any) {
    console.error('Error en chatConversation:', error)
    throw new APIError(error?.message || 'Error en la conversación', 400, null, true)
  }
}
