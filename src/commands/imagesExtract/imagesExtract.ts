import * as vscode from 'vscode'
import { scanDirectories } from './interface/scanDirectories'
import { scanImages } from './interface/scanImages'

export async function imagesExtract(
  extensionUri: vscode.Uri,
  folderUri: vscode.Uri
) {
  const panel = vscode.window.createWebviewPanel(
    'emai.imagesExtract',
    '✨emAI：图片捕捉',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      // 允许加载插件内的资源
      localResourceRoots: [
        vscode.Uri.joinPath(extensionUri, 'dist', 'webview'),
        folderUri
      ]
    }
  )

  const indexPath = vscode.Uri.joinPath(
    extensionUri,
    'dist',
    'webview',
    'index.html'
  )

  let html = await vscode.workspace.fs.readFile(indexPath)
  let htmlContent = html.toString()

  // 将资源路径转换为 WebView 可访问的 URI
  const webviewUri = panel.webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'dist', 'webview')
  )

  // 替换 HTML 中的资源路径（如 /assets/ → webview-uri/assets/）
  htmlContent = htmlContent.replace(
    /src="\.\/(assets\/[^"]+)"/g,
    `src="${webviewUri}/$1"`
  )
  htmlContent = htmlContent.replace(
    /href="\.\/(assets\/[^"]+)"/g,
    `href="${webviewUri}/$1"`
  )

  panel.webview.html = htmlContent

  panel.webview.onDidReceiveMessage(message => {
    if (message.command === 'pageReady') {
      panel.webview.postMessage({
        command: 'navigate',
        data: { to: '/imgViewer' }
      })
    } else if (message.command === 'fetchDirectory') {
      scanDirectories(folderUri.fsPath)
        .then(ds => {
          panel.webview.postMessage({
            command: 'dataDirectory',
            data: { code: '200', data: ds }
          })
        })
        .catch(err => {
          console.error(err)
          panel.webview.postMessage({
            command: 'dataDirectory',
            data: { code: '500', message: '✨emAI：获取目录树失败' }
          })
        })
    } else if (message.command === 'fetchImages') {
      scanImages(folderUri, message.data.folder)
        .then(images => {
          panel.webview.postMessage({
            command: 'dataImages',
            data: {
              code: '200',
              data: images.map(img => {
                return {
                  ...img,
                  path: panel.webview
                    .asWebviewUri(vscode.Uri.file(img.path))
                    .toString()
                }
              })
            }
          })
        })
        .catch(err => {
          console.error(err)
          panel.webview.postMessage({
            command: 'dataImages',
            data: { code: '500', message: '✨emAI：获取图片失败' }
          })
        })
    }
  })
}
