import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { processDocument } from './processor'

// Desabilita avisos de segurança em desenvolvimento
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hidden', // Estilo moderno sem a barra nativa no topo
    titleBarOverlay: {
      color: '#000000',
      symbolColor: '#ffffff',
      height: 38
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false // Para facilitar no MVP
    },
    backgroundColor: '#000000',
    show: false // Mostrar apenas quando estiver pronto para evitar flash branco
  })

  // No Vite em desenvolvimento, a variável de ambiente VITE_DEV_SERVER_URL é injetada
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    // Em produção, carregar o arquivo index.html compilado
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// === IPC Handlers ===
ipcMain.handle('process-file', async (event, filePath, config) => {
  console.log('Iniciando processamento do arquivo:', filePath)
  try {
    const result = await processDocument(filePath, config, (progress, msg) => {
      // Aqui poderíamos emitir um evento via webContents, mas estamos usando setTimeout no frontend no mock.
      // Futuramente: event.sender.send('progress-update', { progress, msg })
    })
    return result
  } catch (error: any) {
    console.error(error)
    return { success: false, error: error.message }
  }
})
