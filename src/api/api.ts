import * as vscode from 'vscode'
import hookFetch from 'hook-fetch'

export function getApi() {
  const config = vscode.workspace.getConfiguration('emai')
  return hookFetch.create({
    baseURL: config.get('baseURL'),
    headers: {
      'content-type': 'application/json'
    }
  })
}
