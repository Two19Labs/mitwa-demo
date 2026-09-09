import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import os from 'os'
import crypto from 'crypto'
import { EdgeTTS } from 'node-edge-tts'

const cacheDir = path.join(os.tmpdir(), 'mitwa_tts_cache')
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true })
}

function edgeTtsPlugin() {
  return {
    name: 'edge-tts-middleware',
    configureServer(server) {
      server.middlewares.use('/api/tts', async (req, res) => {
        try {
          const parsedUrl = new URL(req.url, 'http://localhost:5173')
          const text = parsedUrl.searchParams.get('text') || parsedUrl.searchParams.get('q') || ''
          const voice = parsedUrl.searchParams.get('voice') || 'hi-IN-SwaraNeural'
          
          if (!text.trim()) {
            res.statusCode = 400
            return res.end('Missing text parameter')
          }

          const hash = crypto.createHash('md5').update(`${voice}_${text}`).digest('hex')
          const filePath = path.join(cacheDir, `${hash}.mp3`)

          if (!fs.existsSync(filePath)) {
            const lang = voice.startsWith('en-IN') ? 'en-IN' : 'hi-IN'
            const tts = new EdgeTTS({
              voice,
              lang,
              outputFormat: 'audio-24khz-48kbitrate-mono-mp3'
            })
            await tts.ttsPromise(text, filePath)
          }

          const stat = fs.statSync(filePath)
          res.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'Content-Length': stat.size,
            'Cache-Control': 'public, max-age=86400',
            'Access-Control-Allow-Origin': '*'
          })
          const stream = fs.createReadStream(filePath)
          stream.pipe(res)
        } catch (err) {
          console.error('Edge TTS Middleware Error:', err)
          res.statusCode = 500
          res.end('TTS generation error')
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), edgeTtsPlugin()],
  server: {
    port: 5173,
    host: true
  }
})
