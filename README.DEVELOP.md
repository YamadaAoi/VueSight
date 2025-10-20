## 调试

打开`src\extension.ts`文件，按下`F5`键，会打开一个新的vscode窗口进行插件调试

## 开发

开发完成提交代码前，运行`pnpm csadd`命令，编写本次提交内容梗概，用于`CHANGELOG`

## 打包

- 标记tag
  `git tag v0.0.1`
  `git push origin v0.0.1`
- 安装依赖
  `npm i -g @vscode/vsce`
- 运行命令
  `pnpm vsix`
