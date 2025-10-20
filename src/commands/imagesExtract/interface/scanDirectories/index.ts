import path from 'node:path'
import fg from 'fast-glob'

interface DirectoryNode {
  name: string
  path: string
  type: 'directory'
  children: DirectoryNode[]
}

export async function scanDirectories(rootDir: string) {
  // 使用 glob 获取所有子目录（包括嵌套）
  const dirPaths = await fg('**/', {
    cwd: rootDir,
    onlyDirectories: true, // 只匹配目录
    absolute: false, // 相对路径（相对于 cwd）
    deep: 10, // 最大递归深度（避免无限深）
    suppressErrors: true, // 忽略无法访问的目录错误
    ignore: ['node_modules']
  })

  // 添加根目录本身
  dirPaths.unshift('') // 根目录用空字符串表示

  // 构建树形结构
  const treeMap = new Map<string, DirectoryNode>()
  const root: DirectoryNode = {
    name: path.basename(path.resolve(rootDir)),
    path: '.',
    type: 'directory',
    children: []
  }
  treeMap.set('', root) // 根目录映射

  // 按路径层级排序，确保父目录先处理
  dirPaths.sort((a, b) => a.split('/').length - b.split('/').length)

  for (const relativeDir of dirPaths) {
    if (relativeDir === '') continue // 跳过根目录（已添加）

    const dirPath = relativeDir.replace(/\/$/, '') // 去掉末尾斜杠
    const parts = dirPath.split('/')
    const name = parts[parts.length - 1]
    const parentPath = parts.slice(0, -1).join('/') || ''

    const node: DirectoryNode = {
      name,
      path: relativeDir,
      type: 'directory',
      children: []
    }

    treeMap.set(relativeDir, node)

    // 找到父节点并添加
    const parent = treeMap.get(parentPath)
    if (parent) {
      parent.children.push(node)
    }
  }

  return [root]
}
