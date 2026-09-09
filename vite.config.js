import { defineConfig, loadEnv } from 'vite'
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

function ttsPlugin(env) {
  return {
    name: 'mitwa-tts-middleware',
    configureServer(server) {
      // 1. ElevenLabs Endpoint
      server.middlewares.use('/api/tts/elevenlabs', async (req, res) => {
        try {
          const parsedUrl = new URL(req.url, 'http://localhost:5173')
          const text = parsedUrl.searchParams.get('text') || ''
          const voiceId = parsedUrl.searchParams.get('voice_id') || env.ELEVENLABS_VOICE_ID || 'ThT5KcBeYPX3keUQqHPh'
          const apiKey = req.headers['xi-api-key'] || parsedUrl.searchParams.get('api_key') || env.ELEVENLABS_API_KEY || ''

          if (!apiKey) {
            res.statusCode = 401
            res.setHeader('Content-Type', 'application/json')
            return res.end(JSON.stringify({ error: 'Missing ElevenLabs API key' }))
          }

          if (!text.trim()) {
            res.statusCode = 400
            return res.end(JSON.stringify({ error: 'Missing text' }))
          }

          const hash = crypto.createHash('md5').update(`el_${voiceId}_${text}`).digest('hex')
          const filePath = path.join(cacheDir, `${hash}.mp3`)

          if (!fs.existsSync(filePath)) {
            const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
              method: 'POST',
              headers: {
                'xi-api-key': apiKey,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                text: text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                  stability: 0.52,
                  similarity_boost: 0.78,
                  style: 0.2,
                  use_speaker_boost: true
                }
              })
            })

            if (!elRes.ok) {
              const errText = await elRes.text()
              res.statusCode = elRes.status
              res.setHeader('Content-Type', 'application/json')
              return res.end(errText)
            }

            const buffer = Buffer.from(await elRes.arrayBuffer())
            fs.writeFileSync(filePath, buffer)
          }

          const stat = fs.statSync(filePath)
          res.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'Content-Length': stat.size,
            'Cache-Control': 'public, max-age=86400',
            'Access-Control-Allow-Origin': '*'
          })
          fs.createReadStream(filePath).pipe(res)
        } catch (err) {
          console.error('ElevenLabs Middleware Error:', err)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err.message }))
        }
      })

      // 2. Azure Edge Neural Endpoint (Zero-API-key fallback & default)
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
          fs.createReadStream(filePath).pipe(res)
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
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), ttsPlugin(env)],
    server: {
      port: 5173,
      host: true
    }
  }
})
