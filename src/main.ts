import './style.css'

// Element References
const dropZone = document.getElementById('drop-zone') as HTMLDivElement
const fileInput = document.getElementById('file-input') as HTMLInputElement
const browseBtn = document.getElementById('browse-btn') as HTMLButtonElement
const settingsBtn = document.getElementById('settings-btn') as HTMLButtonElement
const settingsModal = document.getElementById('settings-modal') as HTMLDivElement
const closeSettingsBtn = document.getElementById('close-settings-btn') as HTMLButtonElement
const saveSettingsBtn = document.getElementById('save-settings-btn') as HTMLButtonElement

const progressContainer = document.getElementById('progress-container') as HTMLDivElement
const progressBar = document.getElementById('progress-bar') as HTMLDivElement
const statusText = document.getElementById('status-text') as HTMLSpanElement
const statusPercentage = document.getElementById('status-percentage') as HTMLSpanElement
const logConsole = document.getElementById('log-console') as HTMLDivElement

// State
let selectedProvider = 'elevenlabs'
let apiKeys = {
  elevenlabs: '',
  openai: '',
  openaiText: ''
}

// === Settings Modal Logic ===
settingsBtn.addEventListener('click', () => {
  settingsModal.classList.remove('hidden')
})

const closeModal = () => {
  settingsModal.classList.add('hidden')
}

closeSettingsBtn.addEventListener('click', closeModal)
settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) closeModal()
})

saveSettingsBtn.addEventListener('click', () => {
  const providerRadios = document.getElementsByName('provider')
  providerRadios.forEach((radio: any) => {
    if (radio.checked) selectedProvider = radio.value
  })
  
  apiKeys.openaiText = (document.getElementById('openai-key-input') as HTMLInputElement).value
  
  // Save specific TTS key
  const ttsKey = (document.getElementById('api-key-input') as HTMLInputElement).value
  if (selectedProvider === 'elevenlabs') apiKeys.elevenlabs = ttsKey
  else apiKeys.openai = ttsKey

  closeModal()
  appendLog('System: Settings saved successfully.')
})

// === Drag and Drop Logic ===
browseBtn.addEventListener('click', () => fileInput.click())

fileInput.addEventListener('change', (e) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) handleFile(file)
})

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault()
  dropZone.classList.add('drag-active')
})

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-active')
})

dropZone.addEventListener('drop', (e) => {
  e.preventDefault()
  dropZone.classList.remove('drag-active')
  
  const file = e.dataTransfer?.files?.[0]
  if (file) handleFile(file)
})

function handleFile(file: File) {
  if (!file.name.endsWith('.pdf') && !file.name.endsWith('.md')) {
    alert('Please upload a .pdf or .md file')
    return
  }

  // Hide drop zone and show progress
  dropZone.classList.add('hidden')
  progressContainer.classList.remove('hidden')
  
  appendLog(`Loaded file: ${file.name}`)
  startProcessing(file.path)
}

function appendLog(message: string) {
  const p = document.createElement('p')
  p.className = 'log-entry'
  p.innerText = `> ${message}`
  logConsole.appendChild(p)
  logConsole.scrollTop = logConsole.scrollHeight
}

function updateProgress(percentage: number, status: string) {
  progressBar.style.width = `${percentage}%`
  statusPercentage.innerText = `${percentage}%`
  statusText.innerText = status
}

async function startProcessing(filePath: string) {
  updateProgress(10, 'Extracting text...')
  appendLog('Sending file to backend for processing...')
  
  try {
    // Comunicando com o Electron backend
    // @ts-ignore
    if (window.electronAPI) {
      // @ts-ignore
      const result = await window.electronAPI.processFile(filePath)
      appendLog(result.message)
      updateProgress(100, 'Audiobook generated successfully!')
    } else {
      appendLog('Warning: Electron API not found (Running in browser?)')
      // Mock progress for demo
      setTimeout(() => updateProgress(30, 'Structuring text with AI...'), 1000)
      setTimeout(() => {
        appendLog('Mocking chunking text...')
        updateProgress(60, 'Generating audio chunks (TTS)...')
      }, 2500)
      setTimeout(() => updateProgress(90, 'Merging audio files...'), 4000)
      setTimeout(() => {
        updateProgress(100, 'Done!')
        appendLog('File saved at /output/audiobook.mp3')
      }, 5500)
    }
  } catch (error: any) {
    appendLog(`Error: ${error.message}`)
    statusText.innerText = 'Processing failed.'
  }
}
