# GPU Legends - eleição offline-first

Para publicar o ZIP, siga [LEIA-PRIMEIRO-VERCEL.md](LEIA-PRIMEIRO-VERCEL.md).

## 1. Nome da eleição e integrantes

**GPU Legends: qual placa de vídeo é a favorita de todos os tempos?**

- Gustavo Luis Ferreira Silva
- Gustavo Martins Ribeiro
- João Vitor Oliveira Souza
- Ryan Luca Zamboni Pedro

Web Apps - Prof. Esp. Leandro Gaudio Rosa. Equipe GPU Legends.

## 2. Objetivo e público

Simular uma eleição de tecnologia para estudantes, com consulta a candidatas, fichas e propostas e registro de escolha mesmo sem conexão. A preferência considera época, impacto, inovação e custo-benefício percebido; não representa um benchmark nem uma recomendação de compra.

## 3. Aplicação publicada e execução

Esta é a exportação para Vercel. Preencher aqui a URL final depois da publicação. O ZIP pode ser enviado diretamente a https://vercel.com/drop. A configuração e os passos para conectar o Neon estão em [LEIA-PRIMEIRO-VERCEL.md](LEIA-PRIMEIRO-VERCEL.md).

Local: Node.js 22, `npm ci`, `.env.local` com `DATABASE_URL`, `npm run build`, `npm start`, `http://localhost:3000`. A geração de tabelas é automática na primeira consulta.

## 4. Tecnologias

Next.js 16.3.4, React 19.2.6, TypeScript 5.9.3, Tailwind CSS 4.2.1, PostgreSQL/Neon com driver HTTP 1.2.0, Service Worker modular, Cache API, IndexedDB e Background Sync quando disponível. Dependências fixadas em `package-lock.json`.

## 5. Funcionalidades

22 GPUs de 1998 a 2025 com fotos reais/imagens oficiais, fontes, propostas e créditos; busca; filtros combinados; favoritos; comparação de até três placas; galeria horizontal; linha do tempo; quiz; urna com confirmação e recibo; fila offline; apuração compartilhada e exportação JSON. O modo apresentação usa uma eleição separada. Abertura com opção de pular, animações pausáveis e suporte a movimento reduzido. Fundo com ilustração estática de GPU.

## 6. Cache e funcionamento offline

Cada build produz a mesma versão única no SW e na interface e gera `public/precache.json` com os JS/CSS do Next.js, ícones e 23 imagens. A confirmação “Disponível offline” exige manifesto e imagens completos. Navegação: Network First com timeout; arquivos/imagens: Cache First; catálogo: Stale While Revalidate; apuração: Network First com snapshot identificado. POST não vai para Cache API. Preferências, identidade e operação ficam no IndexedDB. A primeira visita totalmente offline não prepara o aplicativo.

## 7. Background Sync

Uma transação IndexedDB salva a escolha antes do envio e bloqueia segunda escolha local. A tag `sincronizar-votos` processa a fila quando suportada. Abertura, retorno online, intervalo e botão manual complementam o recurso. A mesma operationId é reenviada em todas as tentativas. PostgreSQL garante unicidade da operação e de eleição + eleitor. Só o aceite do servidor transforma a pendência em voto confirmado e aumenta a apuração.

## 8. Push Notifications

Simulação didática local: permissão pelo botão, mensagem `DEMO_NOTIFICATION` ao SW, `showNotification` e clique abrindo os resultados. Negar permissão não impede votar. Não existe push remoto, assinatura Push API, VAPID ou servidor de envio nesta versão.

## 9. Preload, prefetch e DNS-prefetch

Preload da ilustração visível na abertura. Prefetch da apuração após o conteúdo essencial, online e respeitando economia de dados/conexão 2G. DNS-prefetch é dispensado: fotos e scripts são locais, e as fontes são do sistema. Os links de referência são navegações opcionais externas.

## 10. Testes e evidências

[Registro de verificação desta exportação](docs/VERIFICACAO.md). O build Next.js, TypeScript, o SQL em PostgreSQL/PGlite e a fila em IndexedDB controlado foram verificados. Não são capturas de navegador ou prova de uma implantação na conta Vercel. Para a atividade, incluir os prints de DevTools e uma gravação real com reload offline, pendência e sincronização.

## 11. Problemas e soluções

A versão original dependia de Worker/Cloudflare D1. Esta exportação usa Next.js padrão e Neon HTTP no servidor. Queda de resposta depois do aceite: mesmo ID e idempotência. Inicializações concorrentes: trava transacional e esquema idempotente. Cache de outro build: versão única gerada automaticamente. Configuração de banco ausente: resposta 503, escolha preservada na fila e nenhum voto falsamente confirmado.

## 12. Limitações e melhorias

Votos compartilhados exigem `DATABASE_URL` de um Neon conectado ao projeto. Os dados da hospedagem anterior não são transferidos automaticamente. Identidade anônima por navegador; limpar armazenamento ou usar outro dispositivo pode gerar nova identidade. Eleições abertas, sem prazo configurável ou painel administrativo. Background Sync e notificações variam por navegador. Testes completos de DevTools, instalação, acessibilidade e Lighthouse devem ser feitos no ambiente da demonstração.

## 13. Vídeo de demonstração

Pendente de gravação real e publicação do link. Use [o roteiro de até 7 minutos](docs/ROTEIRO.md) e acrescente aqui o link acessível ao professor. Para a entrega da atividade, o repositório GitHub também deve reunir código, prints e esse link.

## Créditos

`lib/candidates.ts` reúne as fontes técnicas; `lib/image-sources.json` guarda autores, URLs, licenças e alterações das fotos. Imagens oficiais mantêm os direitos dos fabricantes; a ilustração decorativa do fundo não representa um modelo específico. Licenças de estilos em `vendor`.
