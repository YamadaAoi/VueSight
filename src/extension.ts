import * as vscode from 'vscode'
import { codeOptimize } from './commands/codeOptimize/codeOptimize'
import {
  inlineSuggestion,
  codeFullCompletion
} from './commands/codeFullCompletion/codeFullCompletion'
import { imagesExtract } from './commands/imagesExtract/imagesExtract'

export function activate(context: vscode.ExtensionContext) {
  console.log('✨VueSight is now active!')

  // 代码优化
  const codeOptimizeCommand = vscode.commands.registerTextEditorCommand(
    'VueSight.codeOptimize',
    editor => {
      console.log('VueSight.codeOptimize', editor.document.uri.fsPath)

      const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
      )
      statusBarItem.text = '$(sync-spin) ✨VueSight：思考中...'
      statusBarItem.show()

      codeOptimize(editor.document.getText(), editor.document.uri.fsPath)
        .catch(err => {
          console.error('✨VueSight代码优化异常:', err)
          vscode.window.showErrorMessage(
            `✨VueSight代码优化异常：${err?.status ?? ''} ${err?.message}`
          )
        })
        .finally(() => {
          statusBarItem.dispose()
        })
    }
  )

  // 代码补全
  const codeFullCompletionCommand = vscode.commands.registerCommand(
    'VueSight.codeFullCompletion',
    () => {
      const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
      )
      statusBarItem.text = '$(sync-spin) ✨VueSight：思考中...'
      statusBarItem.show()

      codeFullCompletion()
        .catch(err => {
          console.error('✨VueSight代码补全异常:', err)
          vscode.window.showErrorMessage(
            `✨VueSight代码补全异常：${err?.status ?? ''} ${err?.message}`
          )
        })
        .finally(() => {
          statusBarItem.dispose()
        })
    }
  )

  const inlineProvider = vscode.languages.registerInlineCompletionItemProvider(
    ['vue', 'typescript', 'javascript'],
    {
      provideInlineCompletionItems(document, position) {
        if (
          inlineSuggestion.text &&
          inlineSuggestion.uri &&
          inlineSuggestion.uri.toString() === document.uri.toString() &&
          inlineSuggestion.position &&
          position.isEqual(inlineSuggestion.position)
        ) {
          const item = new vscode.InlineCompletionItem(
            inlineSuggestion.text,
            new vscode.Range(position, position)
          )
          inlineSuggestion.setSuggestion(null)
          return [item]
        }
        return []
      }
    }
  )

  const imagesExtractCommand = vscode.commands.registerCommand(
    'VueSight.imagesExtract',
    (uri: vscode.Uri) => {
      imagesExtract(context.extensionUri, uri).catch(err => {
        vscode.window.showErrorMessage(`✨VueSight启动预览失败: ${err}`)
      })
    }
  )

  context.subscriptions.push(
    codeOptimizeCommand,
    codeFullCompletionCommand,
    inlineProvider,
    imagesExtractCommand
  )
}

export function deactivate() {}
