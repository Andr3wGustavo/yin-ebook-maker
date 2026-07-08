# Yin Ebook Maker - Architecture & Docs

## Visão Geral
Yin Ebook Maker é um aplicativo Desktop B&W, premium e minimalista, para conversão de e-books (PDF e MD) em Audiobooks de alta qualidade, utilizando serviços de inteligência artificial de ponta (ElevenLabs ou OpenAI TTS).

## Arquitetura
O sistema foi desenhado para ser leve no frontend e robusto no backend local.

1. **Frontend (Vite + Vanilla CSS/TS)**
   - Um layout livre de frameworks pesados (sem React/Vue) para garantir performance nativa.
   - Design System minimalista em Preto e Branco com animações suaves de entrada, hover e Drag and Drop.
   - Comunicação via IPC (Inter-Process Communication) com o backend Node.js, não deixando a UI travar (non-blocking).
   
2. **Backend (Electron Main Process / Node.js)**
   - **`electron/main.ts`**: Ponto de entrada, inicializa a janela sem borda (frameless) e expõe os Handlers IPC.
   - **`electron/processor.ts`**: O cérebro do app. Recebe o arquivo e processa na seguinte ordem:
     - **Extrator**: Faz o parse de PDF (`pdf-parse`) ou MD.
     - **Agente LLM (Estruturador)**: O texto bruto é enviado para a OpenAI (GPT-4o mini/Claude) com um prompt para remover cabeçalhos/rodapés e separar logicamente os blocos (chunking) evitando cortes ruins no áudio.
     - **TTS Engine**: Mapeia a lista de chunks em requisições concorrentes ou em fila para o TTS (ElevenLabs ou OpenAI TTS). 
     - **Concatenador de Áudio**: Utiliza `fluent-ffmpeg` para fazer o "merge" de todos os micro-arquivos temporários gerados num arquivo único (`.mp3` ou `.wav`).

## Como Iniciar (Setup Dev)
Para rodar localmente após clonar o repositório:
1. `npm install` (Instala as dependências).
2. `npm run dev` (Inicia o Electron em modo watch integrado com o Vite).
3. Na UI, clique na "Engrenagem" e preencha as API Keys (Elas não são salvas no repositório, cuidado!).

## Next Steps / Roadmap
- [ ] Implementar integração Real com a API do ElevenLabs no processor.
- [ ] Implementar fluxo de salvar arquivo local usando as APIs nativas do Electron (`dialog.showSaveDialog`).
- [ ] Conectar ao Spotify API/Youtube para upload direto.
