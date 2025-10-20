import * as vscdoe from 'vscode'
import type OpenAI from 'openai'
import { getApi } from '../api'

export type ChatCompletionContentPart = OpenAI.ChatCompletionContentPart
export type ChatCompletionMessageParam = OpenAI.ChatCompletionMessageParam

export function chat(messages: ChatCompletionMessageParam[]) {
  const config = vscdoe.workspace.getConfiguration('emai')
  const api = getApi()
  return api
    .post<OpenAI.ChatCompletion>('/chat/completions', {
      temperature: 0.1,
      model: config.get('model'),
      chat_template_kwargs: { enable_thinking: false },
      messages
    })
    .json()
}
