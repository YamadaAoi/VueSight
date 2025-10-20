/**
 * 代码标签
 */
export interface CodeMark {
  start: string
  end: string
}

/**
 * AI生成代码标签
 * @returns
 */
export function getCodeMark(): CodeMark {
  const timestamp = Date.now()
  return {
    start: `<code_${timestamp}>`,
    end: `</code_${timestamp}>`
  }
}

/**
 * 获取AI生成代码
 * @param text
 * @param mark
 * @returns
 */
export function safeExtract(text: string, mark: CodeMark) {
  const startPos = text.lastIndexOf(mark.start)
  const endPos = text.lastIndexOf(mark.end)
  if (startPos === -1 || endPos <= startPos) {
    return ''
  } else {
    return text.slice(startPos + mark.start.length, endPos).trim()
  }
}
