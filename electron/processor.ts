import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import OpenAI from 'openai'
// import pdf from 'pdf-parse' - Using require because it's a CJS module without default export sometimes
const pdf = require('pdf-parse')
const ffmpeg = require('fluent-ffmpeg')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path

ffmpeg.setFfmpegPath(ffmpegPath)

export async function processDocument(filePath: string, config: any, progressCallback: (progress: number, msg: string) => void) {
  try {
    progressCallback(10, 'Reading file...')
    const ext = path.extname(filePath).toLowerCase()
    let text = ''
    
    if (ext === '.md') {
      text = fs.readFileSync(filePath, 'utf-8')
    } else if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath)
      const data = await pdf(dataBuffer)
      text = data.text
    } else {
      throw new Error('Unsupported format. Use .pdf or .md')
    }
    
    // Fallback if no text extracted
    if (!text || text.trim() === '') {
      throw new Error('No text could be extracted from the file.')
    }

    progressCallback(30, 'Structuring text with AI...')
    let chunks: string[] = []
    
    if (config.keys.openaiText) {
      const openai = new OpenAI({ apiKey: config.keys.openaiText })
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an assistant that prepares raw book text for Text-to-Speech narration. Remove page numbers, meaningless footers/headers, and split the text into a JSON array of clean paragraphs/chunks (approx 500 chars each) that flow naturally for reading.' },
            { role: 'user', content: `Format this text into a JSON array of strings:\n\n${text.substring(0, 5000)}` } // Limiting to 5000 chars for demo/cost
          ],
          response_format: { type: 'json_object' }
        })
        const resultJson = JSON.parse(response.choices[0].message.content || '{"chunks":[]}')
        chunks = resultJson.chunks || resultJson.array || []
      } catch (e) {
        console.error('LLM Chunking failed, falling back to regex:', e)
        chunks = fallbackChunking(text)
      }
    } else {
      chunks = fallbackChunking(text)
    }

    if (chunks.length === 0) throw new Error('Failed to create text chunks.')
    
    progressCallback(50, `Generating audio via ${config.provider}...`)
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yin-ebook-'))
    const audioFiles: string[] = []

    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i]
      const outPath = path.join(tempDir, `chunk_${i}.mp3`)
      
      if (config.provider === 'openai' && config.keys.openai) {
        const openai = new OpenAI({ apiKey: config.keys.openai })
        const mp3 = await openai.audio.speech.create({
          model: 'tts-1',
          voice: 'alloy',
          input: chunkText,
        })
        const buffer = Buffer.from(await mp3.arrayBuffer())
        fs.writeFileSync(outPath, buffer)
        audioFiles.push(outPath)
      } else if (config.provider === 'elevenlabs' && config.keys.elevenlabs) {
        // ElevenLabs API via fetch
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': config.keys.elevenlabs,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: chunkText,
            model_id: 'eleven_monolingual_v1',
            voice_settings: { stability: 0.5, similarity_boost: 0.5 }
          })
        })
        if (!response.ok) throw new Error(`ElevenLabs Error: ${response.statusText}`)
        const arrayBuffer = await response.arrayBuffer()
        fs.writeFileSync(outPath, Buffer.from(arrayBuffer))
        audioFiles.push(outPath)
      } else {
        // Simulation mode (No API Key)
        await new Promise(r => setTimeout(r, 1000))
      }
      progressCallback(50 + ((i / chunks.length) * 30), `Generated chunk ${i+1}/${chunks.length}...`)
    }
    
    progressCallback(80, 'Merging audio files...')
    
    // Se estiver em modo simulação, retornamos sucesso rápido
    if (audioFiles.length === 0) {
      await new Promise(r => setTimeout(r, 2000))
      return { success: true, message: 'Audiobook simulated successfully! (Add API keys for real processing)' }
    }

    const finalOutputFile = path.join(os.homedir(), 'Desktop', `Audiobook_${Date.now()}.mp3`)
    
    await mergeAudioFiles(audioFiles, finalOutputFile)
    
    // Limpeza de arquivos temp
    audioFiles.forEach(f => fs.unlinkSync(f))
    fs.rmdirSync(tempDir)

    progressCallback(100, 'Audiobook gerado com sucesso!')
    return { success: true, message: `Audiobook saved to Desktop: ${finalOutputFile}` }
  } catch (error: any) {
    throw new Error(error.message || 'Erro interno no processamento')
  }
}

function fallbackChunking(text: string): string[] {
  // Simple fallback logic to chunk text by paragraphs without breaking sentences
  return text.split('\n\n')
    .map(t => t.trim())
    .filter(t => t.length > 10)
    .slice(0, 5) // Limit to 5 chunks for simulation/safety
}

function mergeAudioFiles(files: string[], output: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const cmd = ffmpeg()
    files.forEach(file => {
      cmd.input(file)
    })
    
    cmd.on('error', (err: any) => reject(err))
       .on('end', () => resolve())
       .mergeToFile(output, os.tmpdir())
  })
}
