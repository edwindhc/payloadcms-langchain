import { ChatOpenAI } from '@langchain/openai'
import { BufferMemory } from 'langchain/memory'
import { ConversationChain } from 'langchain/chains'
import { LanguageModelLike } from '@langchain/core/language_models/base'

export class ConversationMemory {
  private memory: BufferMemory
  private chain: ConversationChain

  constructor(model: LanguageModelLike) {
    this.memory = new BufferMemory({
      returnMessages: true,
      memoryKey: 'chat_history',
      inputKey: 'input',
      outputKey: 'output',
    })

    this.chain = new ConversationChain({
      llm: model as ChatOpenAI,
      memory: this.memory,
    })
  }

  async addMessage(message: string, role: 'user' | 'assistant' | 'system') {
    await this.memory.saveContext(
      { input: message },
      { output: role === 'user' ? 'Assistant: ' : 'User: ' },
    )
  }

  async getContext() {
    return await this.memory.loadMemoryVariables({})
  }

  async clear() {
    await this.memory.clear()
  }
}
