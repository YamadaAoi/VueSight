<template>
  <div class="img-viewer">
    <div class="folder-tree">
      <ElTree
        :data="folders"
        node-key="path"
        :current-node-key="curKey"
        :default-expand-all="true"
        :highlight-current="true"
        :check-on-click-node="true"
        :expand-on-click-node="false"
        :props="{
          label: 'name'
        }"
        @current-change="onPick"
      />
    </div>
    <div class="file-body" @click.stop="chooseFile('')">
      <div
        v-for="item in files"
        :key="item.path"
        :class="['file-item', item.path === curPath ? 'picked' : '']"
        @dblclick.stop="pickFolder(item)"
      >
        <div class="file-icon" @click.stop="chooseFile(item.path)">
          <ElImage
            class="file-img"
            :src="item.type === 'file' ? item.path : folder"
            fit="scale-down"
            lazy
            show-progress
          />
        </div>
        <div class="file-name" :title="item.name" @click="copy(item.name)">
          {{ item.name }}
        </div>
      </div>
    </div>
    <ElImageViewer
      v-if="previewIndex > -1"
      show-progress
      :initial-index="previewIndex"
      :url-list="imageList"
      @close="closeElImageViewer"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ElTree, ElImage, ElImageViewer } from 'element-plus'
import { clipboard } from '@/util'
import { vscodeApi } from '@/api/vscode'
import folder from '@/assets/images/folder.svg'

interface DirectoryNode {
  name: string
  path: string
  type: 'directory'
  children: DirectoryNode[]
}

interface ImageNode {
  name: string
  path: string
  type: 'file'
  ext: string
}

const folders = ref<DirectoryNode[]>([])
const curKey = ref('')
const files = ref<Array<DirectoryNode | ImageNode>>([])
const curPath = ref('')
const previewIndex = ref(-1)
const imageList = computed(() =>
  files.value.filter(f => f.type === 'file').map(f => f.path)
)

onMounted(() => {
  getFolders()
  window.addEventListener('message', onMessage)
})

onBeforeUnmount(() => {
  window.removeEventListener('message', onMessage)
})

function onMessage(event: MessageEvent) {
  const message = event.data
  if (message.command === 'dataDirectory') {
    if (message.data.code === '200') {
      folders.value = message.data.data ?? []
      if (folders.value.length) {
        onPick(folders.value[0])
      }
    }
  } else if (message.command === 'dataImages') {
    if (message.data.code === '200') {
      files.value = files.value.concat(message.data.data ?? [])
    }
  }
}

function pickFolder(node: DirectoryNode | ImageNode) {
  if (node.type === 'directory') {
    onPick(node)
  }
}

function onPick(data: DirectoryNode) {
  curKey.value = data.path
  chooseFile('')
  if (data.children?.length) {
    files.value = data.children.concat()
  } else {
    files.value = []
  }
  getImages(data.path)
}

function chooseFile(p: string) {
  curPath.value = p
  if (p) {
    previewIndex.value = imageList.value.findIndex(src => src === p)
  }
}

function closeElImageViewer() {
  previewIndex.value = -1
}

function getImages(folder: string) {
  if (folder) {
    vscodeApi.vscode?.postMessage({
      command: 'fetchImages',
      data: {
        folder
      }
    })
  }
}

function getFolders() {
  vscodeApi.vscode?.postMessage({
    command: 'fetchDirectory'
  })
}

function copy(text: string) {
  clipboard(text)
}
</script>

<style scoped lang="scss">
.img-viewer {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;

  .folder-tree {
    width: 300px;
    height: 100%;
    padding: 14px;
    border-right: 1px solid var(--app-border-color);
    overflow: auto;
  }

  .file-body {
    width: calc(100% - 300px);
    height: 100%;
    padding: 16px;
    display: grid;
    grid-template-columns: repeat(auto-fit, 158px);
    grid-gap: 16px;
    align-content: start;
    justify-content: start;
    overflow-y: auto;

    .file-item {
      width: 158px;
      height: 178px;
      position: relative;
      padding: 6px 6px 0 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      .file-icon {
        width: 100%;
        height: calc(100% - 30px);
        display: flex;
        align-items: center;
        justify-content: center;

        .file-img {
          width: 100%;
          height: 100%;
        }
      }

      .file-name {
        width: 100%;
        height: 30px;
        line-height: 30px;
        cursor: copy;
        color: var(--app-item-label);
        text-align: center;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &:hover {
        background-color: var(--app-item-hover-bg-color);
      }
    }
    .picked {
      background-color: var(--app-item-hover-bg-color);
    }
  }

  :deep(.el-image-viewer__wrapper) {
    .el-image-viewer__mask {
      opacity: 1;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
    }
  }
}
</style>
