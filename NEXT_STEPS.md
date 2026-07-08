# Contexto e Próximos Passos (Next Steps)

Este arquivo serve como **memória** para retomarmos o desenvolvimento exatamente de onde paramos, garantindo que nada seja esquecido.

## 📍 Onde Paramos (Estado Atual)
- **UI/Frontend:** Finalizado. Interface B&W, Drag-and-Drop, Modal de Configurações para as chaves de API (ElevenLabs e OpenAI) implementados. IPC (Frontend <-> Backend) funcionando.
- **Backend Core:** Finalizado. O `processor.ts` já está lendo PDFs/MDs reais, quebrando o texto com Inteligência Artificial (GPT-4o mini via API), fazendo requisições reais para as APIs de TTS, baixando os áudios parciais e "costurando" (merge) tudo com `fluent-ffmpeg`.
- **Gargalo Atual:** O arquivo final (`.mp3`) está sendo salvo automaticamente com um caminho engessado direto no *Desktop* do sistema. E o fluxo End-to-End não foi testado com chaves de API reais na máquina do usuário.

## 🛠 O Que Falta Implementar Imediatamente (To-Do)
1. **Caixa de Diálogo "Salvar Como" Nativa:** Modificar o `processor.ts` e o `main.ts` para abrir o `dialog.showSaveDialog` do Electron ao final do processamento, permitindo que o usuário escolha a pasta de destino e o nome do arquivo final do Audiobook.
2. **Validação de Limites e Teste Real:** Iniciar o app (`npm run dev`), inserir chaves reais na UI e jogar um PDF de teste para capturar possíveis erros de limite de requisições da OpenAI (Too Many Requests) e aplicar pequenos `delays` (sleeps) entre as requisições se necessário.

## 🚀 Ideias e Features Futuras (Roadmap de Longo Prazo)
Estas opções já estão visíveis na UI como `Coming Soon`:

- **Agente Revisor (IA Ouvinte):**
  - **Como fazer:** Antes de fazer o merge com o `ffmpeg`, enviar os micro-áudios gerados para uma API de transcrição super-rápida (Whisper). Comparar o que foi dito com o texto original em busca de erros grotescos de pronúncia. Se errar, forçar uma regeração do áudio enviando parâmetros fonéticos para o ElevenLabs.
- **Auto-Upload YouTube:**
  - **Como fazer:** Usar o FFmpeg no backend para pegar a capa do livro (imagem), cruzar com o longo MP3 e renderizar um arquivo `.mp4` estático. Usar a API do YouTube (Google Cloud OAuth) para subir o vídeo automaticamente, colocando o título gerado pela IA.
- **Exportador para Spotify:**
  - **Como fazer:** Gerar um arquivo `RSS Feed` automatizado ou usar APIs não-oficiais / parcerias de podcast para automatizar o envio do áudio.
- **Processamento Cloud (Fallback):**
  - Caso notebooks fracos não aguentem o processamento do FFmpeg para áudios de 15 horas, criar uma flag para enviar os chunks de texto para uma AWS Lambda / EC2. A nuvem faz a geração e o merge, e o app desktop só faz o download do MP3 final.
