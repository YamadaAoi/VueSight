import type { WebviewApi } from 'vscode-webview'

class VscodeApi {
  #vscode: WebviewApi<unknown> | undefined

  initVscode() {
    if (typeof acquireVsCodeApi !== 'undefined') {
      this.#vscode = acquireVsCodeApi()
    }
  }

  get vscode() {
    return this.#vscode
  }
}

export const vscodeApi = new VscodeApi()
