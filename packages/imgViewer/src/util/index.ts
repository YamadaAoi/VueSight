import { ElMessage } from 'element-plus'

function clipboardOld(text: string) {
  const input = document.createElement('input')
  document.body.appendChild(input)
  input.setAttribute('value', text)
  input.select()
  document.execCommand('copy')
  document.body.removeChild(input)
  ElMessage.success('复制成功')
}

/**
 * 复制到剪贴板
 * @param text
 */
export function clipboard(text: string) {
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        ElMessage.success('复制成功')
      })
      .catch(() => {
        clipboardOld(text)
      })
  } else {
    clipboardOld(text)
  }
}
