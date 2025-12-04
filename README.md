# VueSight - vscode vue ai小插件

## AI配置

### 去心仪的ai大模型服务平台（如阿里云百炼）申请 apiKey

### 打开vscode设置，搜索`VueSight`

- `baseURL`: 填写ai大模型服务平台的api地址，如`https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`
- `apiKey`: 填写申请到的apiKey
- `model`: 填写ai大模型服务平台的模型（需要支持OpenAI兼容协议）名称，如`qwen-plus`

## 功能介绍

### ✨️VueSight: 优化代码井对比

鼠标右键点击文本区vue、js、ts文档，选择`✨️VueSight: 优化代码并对比`，ai会分析当前代码并返回其改写的代码在vscode中比对。

### ✨️VueSight: 代码补全

鼠标focus在vue、js、ts文档合适位置，使用快捷键`ctrl+i`，ai会推断当前位置合适代码返回，点击`Tab`键采用。

### ✨️VueSight: 图片捕捉

鼠标右键点击文件夹，选择 `✨️VueSight: 图片捕捉`，自动抓取文件夹内所有图片预览，点击文件名复制。
