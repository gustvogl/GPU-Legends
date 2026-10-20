# Verificação da exportação para Vercel

Versão 5.0.0, preparada em 20/10/2026 a partir do código GPU Legends (commit 524a4e45d4e9dd45e7754fc63cd74398e3c8287d). O código da publicação anterior não foi alterado.

## Verificações executadas

- Instalação pelo npm com lockfile.
- Build Next.js 16.3.4 com webpack e checagem TypeScript concluídos. Página inicial pré-renderizada e quatro rotas de API geradas. Build executado com Node 24.19.0; a configuração de hospedagem seleciona Node 22.x, compatível com as dependências declaradas.
- Manifesto com 32 recursos de núcleo e 23 imagens locais. Caminhos de todos os recursos iniciais conferidos contra os arquivos gerados. Versão única idêntica no JS da interface, SW e manifesto.
- PostgreSQL/PGlite: criação idempotente do esquema, oito chamadas concorrentes da mesma operação contadas uma vez, bloqueio de segunda operação da identidade, reutilização indevida do ID, UUID em maiúsculas, validações de entrada/origem/tipo, estado sem votos, empate e separação da eleição de apresentação.
- Fila IndexedDB controlada: uma única escolha entre duas confirmações simultâneas; persistência pendente após a perda da resposta do servidor; reenvio do mesmo ID confirmado e contado uma vez.
- Service Worker em Cache API controlada: instalação com os arquivos reais do build, navegação/JS/fotos offline, snapshot marcado, POST excluído, limpeza somente dos caches do projeto e preparação parcial sem falso aviso de prontidão.

## Limites da verificação

Não foi configurada uma conexão Neon real nesta sessão e não houve publicação na conta Vercel. A conexão real será testada depois de definir DATABASE_URL e publicar. Os testes de PostgreSQL usaram PGlite com adaptação do transporte HTTP; os testes de IndexedDB/Service Worker foram controlados, sem navegador real. Eles não substituem as capturas DevTools e a gravação offline da atividade. Não foram criados votos de exemplo, métricas Lighthouse ou prints fictícios.

Nenhuma credencial de banco é distribuída e nenhum banco remoto foi alterado.
