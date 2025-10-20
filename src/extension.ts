import * as vscode from 'vscode'
import { codeOptimize } from './commands/codeOptimize/codeOptimize'
import {
  inlineSuggestion,
  codeFullCompletion
} from './commands/codeFullCompletion/codeFullCompletion'
import { imagesExtract } from './commands/imagesExtract/imagesExtract'

export function activate(context: vscode.ExtensionContext) {
  console.log('✨emAI is now active!')

  // 代码优化
  const codeOptimizeCommand = vscode.commands.registerTextEditorCommand(
    'emai.codeOptimize',
    editor => {
      console.log('emai.codeOptimize', editor.document.uri.fsPath)
      codeOptimize(editor.document.getText(), editor.document.uri.fsPath).catch(
        err => {
          vscode.window.showErrorMessage(`✨emAI代码优化: ${err}`)
        }
      )
    }
  )

  // 代码补全
  const codeFullCompletionCommand = vscode.commands.registerCommand(
    'emai.codeFullCompletion',
    () => {
      codeFullCompletion().catch(err => {
        vscode.window.showErrorMessage(`✨emAI代码补全: ${err}`)
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
    'emai.imagesExtract',
    (uri: vscode.Uri) => {
      imagesExtract(context.extensionUri, uri).catch(err => {
        vscode.window.showErrorMessage(`✨emAI启动预览失败: ${err}`)
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
