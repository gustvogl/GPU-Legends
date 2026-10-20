# Roteiro da demonstração - até 7 minutos

Preparar online: conectar o banco, ativar Modo apresentação em Sobre, consultar a apuração e aguardar Disponível offline. Usar perfil de teste sem voto na eleição de apresentação. A divisão abaixo é uma proposta de ensaio, não um histórico de autoria. Todos precisam explicar pelo menos duas decisões técnicas.

| Tempo | Integrante | Demonstração e decisões |
| --- | --- | --- |
| 00:00-02:00 | Gustavo Luis Ferreira Silva | Objetivo, 22 candidatas e critérios. Explicar fotos locais para offline e pausa/movimento reduzido. |
| 02:00-04:00 | Gustavo Martins Ribeiro | Pesquisar, ficha, comparação e urna; abrir e cancelar a confirmação. Explicar transação IndexedDB antes da rede e ID estável/idempotência no servidor. |
| 04:00-06:00 | João Vitor Oliveira Souza | Mostrar SW/caches no DevTools, desligar rede, recarregar, abrir ficha, votar offline, mostrar pending no IndexedDB, reconectar e confirmar o mesmo ID. Explicar estratégias de cache por recurso e Background Sync com alternativas. |
| 06:00-06:50 | Ryan Luca Zamboni Pedro | Demonstrar notificação real e clique na apuração. Explicar consentimento/simulação local e preload/prefetch, com DNS-prefetch dispensado por recursos locais. |

Guardar dez segundos de margem. O vídeo precisa mostrar voz/participação dos quatro e pelo menos um teste offline real. Capturar Application/Service Workers, Cache Storage, IndexedDB, Network offline, fila confirmada, notificação e dicas de carregamento. Confirmação ao voltar online não prova sozinha um evento Background Sync, pois a página também tem esse gatilho. Não apresentar o status Disponível offline como substituto do teste de desligar a rede.

Publicar o vídeo, inserir o endereço no README e reunir as capturas reais no repositório. Não há gravação nem prints fictícios neste ZIP.
