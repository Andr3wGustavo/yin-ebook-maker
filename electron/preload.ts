import { ipcRenderer } from 'electron'

// Adicionamos a API na janela global (window.electronAPI)
window.electronAPI = {
  processFile: (filePath: string, config: any) => ipcRenderer.invoke('process-file', filePath, config)
}
