import path from 'node:path'
import fs from 'fs-extra'
import * as vscode from 'vscode'
import { getCodeMark, safeExtract } from '../../utils/utils'
import { chat } from '../../api/chat/chat'

export async function codeOptimize(code: string, filePath: string) {
  const mark = getCodeMark()
  const prompt = [
    '你是一位资深前端专家，熟练掌握 Vue2、Vue3、JS、TS 等前端技术，拥有丰富的开发经验。',
    '你的任务是仔细理解用户提供的前端代码，运用你的编程经验和理论知识来发现其中的风险和缺陷，将你优化后的完整代码返回给用户。',
    '请严格按照如下要求进行代码优化：',
    `- 必须把最终代码包裹在标签 ${mark.start} 和 ${mark.end} 之间，例如 ${mark.start} {你的最终代码} ${mark.end}`,
    `- 请牢记不要把 你的最终代码 包裹在markdown代码标记\`\`\`内`,
    '- 理解并保留代码内原注释，并添加你认为重要的注释，例如你也没有把握的地方进行注释',
    '- 如果用户给你提供的是js代码或者js编写的vue代码，全部改写为标准的ts代码',
    '- 尽量不使用any类型，为每个变量编写合适的类型',
    '- 如果用户给你提供的是以选项式api编写的vue代码，全部改写为以组合式api编写的vue代码，优先采用<script setup lang="ts">语法糖',
    '- 改写后的vue组件代码严格按照<template>、<script setup lang="ts">、<style scoped lang="scss">的顺序输出',
    '- <template>内引用的ref变量会自动解构，不要使用.value取值',
    '- <script setup>中无需引入编译器宏defineProps、defineEmits和defineExpose，可以直接使用，但是类似computed、ref、watch等方法需要从vue中手动引入',
    '- 组件<template>和<script>标签内使用父组件传递的变量时带上 props. 前缀，让变量来源更清晰',
    '- 优先以 function 关键字定义setup中的函数，用来和const定义的变量明显区分',
    '- vue代码如果有 ::v-deep 深度选择器，将其优化为 :deep()'
  ].join('\n')

  console.log('✨ VueSight：system提示语', prompt)

  const resp = await chat([
    {
      role: 'system',
      content: [
        {
          type: 'text',
          text: prompt
        }
      ]
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: code
        }
      ]
    }
  ])

  if (resp?.choices?.[0]?.message?.content) {
    const code = safeExtract(resp.choices[0].message.content, mark)
    if (code) {
      const parsedPath = path.parse(filePath)
      const newPath = path.join(
        parsedPath.dir,
        `${parsedPath.name}.VueSight${parsedPath.ext}`
      )
      await fs.writeFile(newPath, code)
      await vscode.commands.executeCommand(
        'vscode.diff',
        vscode.Uri.file(filePath),
        vscode.Uri.file(newPath),
        `对比：${path.basename(filePath)} → 优化代码`
      )
    } else {
      throw new Error('此次AI生成代码位置异常，请重试')
    }
  }
}
