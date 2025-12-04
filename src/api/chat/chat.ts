import * as vscdoe from 'vscode'
import type OpenAI from 'openai'
import { getApi } from '../api'

export type ChatCompletionContentPart = OpenAI.ChatCompletionContentPart
export type ChatCompletionMessageParam = OpenAI.ChatCompletionMessageParam

export function chat(messages: ChatCompletionMessageParam[]) {
  const config = vscdoe.workspace.getConfiguration('VueSight')
  const url = config.get<string>('baseURL')
  if (!url) {
    throw new Error('baseURL is not configured')
  }
  const model = config.get<string>('model')
  if (!model) {
    throw new Error('model is not configured')
  }
  const api = getApi()
  return api
    .post<OpenAI.ChatCompletion>(url, {
      temperature: 0.1,
      model,
      messages
    })
    .json()
}
