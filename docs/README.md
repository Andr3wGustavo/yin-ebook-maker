# Core Architecture & Agent Context

This document serves as the technical blueprint and state-preservation context for the Yin Ebook Maker project. It is intended for future AI agents or developers to quickly understand the system's current state, internal mechanisms, and roadmap.

## 1. System Workflow
The conversion from Document to Audiobook is a multi-stage pipeline handled natively within the Electron Node.js runtime (`processor.ts`).

1. **Extraction (pdf-parse / fs)**: Raw text is dumped from the source `.md` or `.pdf` file.
2. **AI Structuring (OpenAI GPT-4o)**: The raw text is heavily unformatted (page numbers, headers, broken sentences). It is sent in chunks to an LLM with strict instructions to output clean, narratable JSON blocks.
3. **Synthesis (TTS Engine)**: The cleaned chunks are dispatched asynchronously to ElevenLabs or OpenAI TTS APIs. Each chunk yields a temporary `.mp3` file.
4. **Merge (ffmpeg)**: A local `ffmpeg` process concatenates the temporary files into the final multi-hour output.

## 2. Current State (Where we stopped)
- **UI/UX**: Fully implemented. The minimalist B&W drag-and-drop interface is operational. Settings modal for API keys is wired up.
- **Electron IPC**: The bridge between the Vite frontend and the Node.js backend is active. The `processFile` method successfully receives the file path.
- **Backend Mocking**: The `processor.ts` file currently *mocks* the AI structuring and TTS generation steps with `setTimeout` to demonstrate progress bar UI feedback.
- **Dependencies Installed**: `pdf-parse`, `openai`, `elevenlabs-node`, `fluent-ffmpeg`, and `@ffmpeg-installer/ffmpeg` are installed in `node_modules` and ready to be imported.

## 3. Future Roadmap & Features
When picking up this project, prioritize the following implementations:

- **Phase 1: Real AI Integration**
  - Implement the actual OpenAI API call in `processor.ts` to structure the text.
  - Implement the TTS API request logic to map the cleaned array of strings into audio buffers.
- **Phase 2: Local I/O & Merging**
  - Save the audio buffers to a `os.tmpdir()` location.
  - Pipe them through `fluent-ffmpeg` to generate the final file.
  - Prompt the user using Electron's `dialog.showSaveDialog` to choose where to save the final `.mp3`.
- **Phase 3: Extended Capabilities (Future Visions)**
  - **Review Agent**: A feature to let the AI "listen" to the output and fix mispronunciations using TTS phonetic adjustments.
  - **Spotify/YouTube Export**: Direct OAuth integration to automatically generate video files (cover art + audio) and push to YouTube, or upload directly to Spotify for Podcasters.
  - **Cloud Offloading**: If local ffmpeg merging or chunking locks up lower-end CPUs, implement a toggle to send the file to a companion Python Cloud Backend.

## 4. Hardware Constraints Considerations
- Merging 10+ hours of `.wav` audio requires significant disk I/O and RAM. Ensure the final format defaults to `.mp3` (192kbps) to maintain high quality while keeping file sizes under 1GB.
- If processing a 1000-page PDF, the LLM token limits must be respected by implementing a sliding window or strict chunk array system.
