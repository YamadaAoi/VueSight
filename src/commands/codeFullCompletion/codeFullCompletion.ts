import * as vscode from 'vscode'
import { getCodeMark, safeExtract } from '../../utils/utils'
import { chat } from '../../api/chat/chat'

export interface InlineSuggestion {
  text: string
  uri: vscode.Uri
  position: vscode.Position
}

class InlineSuggestionProvider {
  #suggestion: InlineSuggestion | null = null

  setSuggestion(s: InlineSuggestion | null) {
    this.#suggestion = s
  }

  get text() {
    return this.#suggestion?.text
  }

  get uri() {
    return this.#suggestion?.uri
  }

  get position() {
    return this.#suggestion?.position
  }
}

export const inlineSuggestion = new InlineSuggestionProvider()

/**
 * 获取工程依赖
 * @param uri
 * @returns
 */
async function getDependencies(uri: vscode.Uri) {
  const folder = vscode.workspace.getWorkspaceFolder(uri)
  if (!folder) {
    return
  }

  try {
    const pkgUri = vscode.Uri.joinPath(folder.uri, 'package.json')
    const pkgBuffer = await vscode.workspace.fs.readFile(pkgUri)
    const pkg = JSON.parse(Buffer.from(pkgBuffer).toString())
    return Object.keys(pkg.dependencies || {}).join(',')
  } catch (error) {
    console.error(error)
  }
}

/**
 * 获取光标后n行代码
 * @param document
 * @param position
 * @param lineCount
 */
function getCodeAfterCursor(
  document: vscode.TextDocument,
  position: vscode.Position,
  lineCount = 5
) {
  const lastLine = document.lineCount - 1
  const endLine = Math.min(position.line + lineCount, lastLine)
  const endCharacter = document.lineAt(endLine).text.length
  const end = new vscode.Position(endLine, endCharacter)
  const range = new vscode.Range(position, end)
  return document.getText(range)
}

export async function codeFullCompletion() {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    return
  }

  const document = editor.document
  const position = editor.selection.active

  const mark = getCodeMark()
  const systemPrompt = [
    '你是一位资深前端专家，熟练掌握 Vue2、Vue3、JS、TS 等前端技术，拥有丰富的代码编写、补全经验。',
    '用户会把他当前编辑器鼠标cursor前后的代码截取给你，你的任务是理解用户提供的代码信息，根据cursor前后代码推测用户此时最可能要编写的代码返回给用户。',
    '请你严格按照如下要求进行代码补全：',
    `- 必须把最终代码包裹在标签 ${mark.start} 和 ${mark.end} 之间，例如 ${mark.start} {你的最终代码} ${mark.end}`,
    `- 请牢记：你的最终代码 会直接贴入cursor处，所以也不要把你的最终代码包裹在 \`\`\`${document.languageId} 或 \`\`\` 之间`,
    '- 如果你推断当前处于ts环境，返回的代码里尽量不要用any类型'
  ].join('\n')

  console.log('✨ VueSight：system提示语', systemPrompt)

  // 光标前15行
  const code1 = document.getText(
    new vscode.Range(
      Math.max(0, position.line - 12),
      0,
      position.line,
      position.character
    )
  )

  // 光标后5行
  const code2 = getCodeAfterCursor(document, position)

  // 当前文件依赖
  const imports = document
    .getText()
    .split('\n')
    .filter(line => line.startsWith('import'))
    .join('\n')

  // 工程依赖
  const dependencies = await getDependencies(document.uri)

  // 代码信息
  const userPrompt = [
    `## File: ${document.fileName} (Language: ${document.languageId})`,
    `## Project Dependencies: ${dependencies}`,
    '## Code Context:',
    '### Before Cursor',
    `\`\`\`${document.languageId}`,
    `${code1}`,
    `\`\`\``,
    '### After Cursor',
    `\`\`\`${document.languageId}`,
    `${code2}`,
    `\`\`\``,
    `## Imports: ${imports}`
  ].join('\n')

  console.log('✨VueSight：用户提示语', userPrompt)

  const resp = await chat([
    {
      role: 'system',
      content: [
        {
          type: 'text',
          text: systemPrompt
        }
      ]
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: userPrompt
        }
      ]
    }
  ])

  if (resp?.choices?.[0]?.message?.content) {
    const code = safeExtract(resp.choices[0].message.content, mark)
    if (code) {
      inlineSuggestion.setSuggestion({
        text: code,
        uri: document.uri,
        position
      })
      vscode.commands.executeCommand('editor.action.inlineSuggest.trigger')
    } else {
      throw new Error('此次AI生成代码位置异常，请重试')
    }
  }
}
