import * as vscode from 'vscode'
import hookFetch from 'hook-fetch'

export function getApi() {
  const config = vscode.workspace.getConfiguration('VueSight')
  const apiKey = config.get<string>('apiKey')
  return hookFetch.create({
    headers: {
      'content-type': 'application/json',
      Authorization: apiKey ? `Bearer ${apiKey}` : undefined
    }
  })
}
