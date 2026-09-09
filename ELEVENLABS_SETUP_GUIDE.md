# 🎙️ ElevenLabs Integration Guide for MITWA

This step-by-step guide explains how to connect **ElevenLabs** to Mitwa for studio-grade, hyper-realistic Indian Hindi and Hinglish conversational voice.

---

## Step 1: Get an ElevenLabs API Key

1. Go to **[https://elevenlabs.io](https://elevenlabs.io)** and Sign Up / Log In.
2. In the bottom-left corner, click on your **Profile Icon** → select **Profile + API Key**.
3. Under **API Keys**, click **Create API Key** (or click the eye icon to view your default key).
4. Copy the key (it starts with `sk_...`).

---

## Step 2: Choose or Clone an Authentic Indian Voice

ElevenLabs has thousands of community and pre-made voices. For the best Indian Hindi/Hinglish results:

### Recommended Pre-made / Library Voices:
1. Click **Voices** → **Voice Library** in the ElevenLabs dashboard.
2. Search for `Indian` or filter by:
   - **Language**: `Hindi` or `English`
   - **Accent**: `Indian`
3. Popular Top-Rated Indian Voices:
   - **Priya / Aditi** (Warm, friendly Indian hospitality voice)
   - **Aarav / Kabir** (Professional Indian corporate front desk)
   - **Ananya** (Casual conversational Hinglish)
4. Click **Add to VoiceLab** to add the voice to your account.
5. Click **View Details** or click the voice in your VoiceLab to copy the **Voice ID** (a 20-character string like `ThT5KcBeYPX3keUQqHPh`).

---

## Step 3: Connect ElevenLabs to MITWA

You can connect ElevenLabs in **two easy ways**:

### Option A: Via the Web UI (No code, fastest!)
1. Open the Mitwa app: **[http://localhost:5173/](http://localhost:5173/)**
2. In the Voice Agent header, click the **"⚡ ElevenLabs"** button.
3. Paste your **ElevenLabs API Key** (`sk_...`).
4. Select a voice (or paste your custom **Voice ID**).
5. Click **"Save & Activate"** and click **"Test Voice"** to hear it speak!

---

### Option B: Via `.env` File (Permanent)
1. In the `mitwa-demo` directory, create or open a `.env` file:
   ```env
   ELEVENLABS_API_KEY=sk_your_elevenlabs_api_key_here
   ELEVENLABS_VOICE_ID=ThT5KcBeYPX3keUQqHPh
   ```
2. Restart the dev server:
   ```bash
   npm.cmd run dev
   ```

---

## Step 4: Verify the Voice

1. Click **"Test Voice"** in the Voice Agent header.
2. You will immediately hear Mitwa speak:
   > *"नमस्ते! मैं मितवा हूँ, बोखारा ग्रिल से। क्या मैं आपकी टेबल बुक करूँ?"*
3. The response is powered by ElevenLabs' **`eleven_multilingual_v2`** model, producing human-like Indian inflection, natural pauses, and flawless Hindi word pronunciation.

---

## 💡 Credit Optimization Tip
Mitwa includes an automatic local audio cache in the Vite server (`os.tmpdir()/mitwa_tts_cache`). Common greetings and repeat confirmation phrases are cached locally after the first generation, saving your ElevenLabs character quota!
