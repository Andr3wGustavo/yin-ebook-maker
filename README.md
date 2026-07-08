# Yin Ebook Maker

A high-performance, minimalist desktop application designed to convert standard e-books (PDF and MD formats) into ultra-realistic AI-narrated audiobooks. Engineered with a frameless black-and-white (B&W) UI and powered by state-of-the-art LLM chunking and TTS capabilities.

## Architecture & Stack
- **Core Engine:** Node.js / Electron
- **Frontend Layer:** Vite, Vanilla TypeScript, Native DOM API (Framework-agnostic for peak performance).
- **Styling:** Vanilla CSS (Glassmorphism, minimalist dark mode aesthetics).
- **Audio & AI:**
  - `ElevenLabs` & `OpenAI TTS` for voice generation.
  - `OpenAI GPT-4o` for structural text comprehension and sanitization.
  - `fluent-ffmpeg` for seamless chunk concatenation.

## Prerequisites & Hardware Requirements
Local processing of audio generation and PDF extraction can be resource-intensive. 

### Local Processing Requirements
- **CPU:** Multi-core processor (e.g., Intel i5 10th gen / Apple M1 or better) for rapid PDF parsing and local ffmpeg encoding.
- **RAM:** Minimum 8GB (16GB recommended for handling massive multi-hour audio concatenation).
- **Network:** High-speed internet required for parallel TTS API requests to ElevenLabs/OpenAI.

### Cloud / Alternative Solutions
If local hardware is a bottleneck, the architecture allows offloading the `Audio Merger` and `Text Structurer` modules to a Serverless Cloud Environment (e.g., AWS Lambda, GCP Cloud Run) or a dedicated Python backend running on a GPU server (AWS EC2).

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Mode**
   ```bash
   npm run dev
   ```

3. **Configure API Keys**
   - Click the settings icon in the UI.
   - Provide your `ElevenLabs` or `OpenAI` API keys.
   - Keys are kept entirely in the local runtime environment.

## Documentation
For deep technical insights, future roadmap, and agent-state context, refer to the `/docs` directory.
