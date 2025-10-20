import path from 'node:path'
import * as vscode from 'vscode'
import fg from 'fast-glob'

interface ImageNode {
  name: string
  path: string
  type: 'file'
  ext: string
}

export async function scanImages(rootDir: vscode.Uri, dirPath: string) {
  const cwd = vscode.Uri.joinPath(rootDir, dirPath).fsPath

  const files = await fg('*.{jpg,jpeg,png,svg,gif,webp,bmp,tiff,avif}', {
    cwd,
    onlyFiles: true,
    absolute: true,
    caseSensitiveMatch: false,
    suppressErrors: true
  })

  const images: ImageNode[] = files.map(file => {
    return {
      name: path.basename(file),
      path: file,
      type: 'file',
      ext: path.extname(file).toLowerCase()
    }
  })

  return images
}
