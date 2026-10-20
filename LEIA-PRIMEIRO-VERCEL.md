# GPU Legends - versão para Vercel

Site completo com 22 placas de vídeo, fotos locais, animações, galeria horizontal, comparação, eleição simulada e fila offline. A identidade visual em preto, vermelho e dourado foi preservada. O fundo é uma ilustração estática de GPU.

## Colocar no ar pelo ZIP

1. Abra **https://vercel.com/drop** e entre na sua conta.
2. Arraste `GPU-Legends-Vercel.zip` diretamente para a página.
3. Escolha sua equipe/conta, dê um nome ao projeto e publique. O projeto usa **Next.js**; as configurações de instalação e build estão no `vercel.json`.
4. Para ativar os **votos compartilhados e a apuração**, conecte um banco **Neon** ao projeto, conforme o passo a passo abaixo.

O catálogo e as animações abrem sem banco configurado. Votos só são confirmados quando o servidor consegue acessar o banco. Sem a conexão, a escolha continua salva como pendente no navegador; não é inventado um resultado nem descartado o voto.

## Configurar o banco de votos

1. No projeto da Vercel, abra **Storage** e adicione/conecte a integração **Neon** pelo Marketplace.
2. Escolha o plano, nome e região do banco e conecte-o a este projeto.
3. Em **Settings → Environment Variables**, confira se existe **`DATABASE_URL`** para **Production**. Se preferir usar um Neon já existente, copie a connection string do painel Neon para essa variável na Vercel.
4. Se a integração tiver criado a variável com um prefixo, copie seu valor para o nome exato `DATABASE_URL`. Não use `NEXT_PUBLIC_DATABASE_URL`.
5. Faça **Redeploy** do projeto para aplicar a conexão.
6. Abra o site e a aba Resultados. As tabelas e o índice são criados automaticamente na primeira consulta, sem votos de exemplo.

A conexão deve apontar para um banco Neon/PostgreSQL acessível pelo driver HTTP do Neon. Não cole uma conexão de outro provedor esperando compatibilidade automática. A credencial fica somente no servidor; ela não está neste ZIP.

O banco utiliza a tabela `gpu_legends_votes`, com unicidade por operação e por eleição + identidade. A criação é idempotente e usa trava transacional entre inicializações concorrentes. A conexão deve permitir leitura, escrita e inicialização desse esquema. Você também pode executar `database/001-votes.sql` no SQL Editor ou `npm run db:setup` para prepará-lo antecipadamente.

## Configuração de publicação

| Campo | Valor |
| --- | --- |
| Framework | Next.js |
| Node.js | 22.x |
| Diretório raiz | A pasta que contém `package.json` |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | Automático do Next.js |
| Variável do servidor | `DATABASE_URL` |

O ZIP possui os arquivos na raiz. Não contém `node_modules`, `.next`, credenciais nem dados do banco anterior. A hospedagem anterior continua independente; seus votos não são transferidos automaticamente para o Neon.

## Alternativa por GitHub

Extraia o ZIP e coloque seu conteúdo na raiz de um repositório. Na Vercel, importe esse repositório como um projeto Next.js. Conecte o mesmo Neon e confirme `DATABASE_URL`. Para atualizações frequentes, use GitHub ou a Vercel CLI: um novo upload pelo Drop cria outro projeto.

## Executar no computador

Com Node.js 22 e npm:

```bash
npm ci
```

Copie `.env.example` para `.env.local` e preencha `DATABASE_URL` com sua conexão Neon. Para testar a versão de produção e o offline:

```bash
npm run build
npm start
```

Abra `http://localhost:3000`. Para editar, use `npm run dev`. O teste completo de cache deve usar o build de produção. Opcionalmente, `npm run db:setup` prepara o mesmo esquema de forma antecipada; a aplicação também o prepara automaticamente.

## Offline e atualizações

O build gera uma versão única do Service Worker, sincronizada com o código da interface, e o arquivo `public/precache.json` com os JS/CSS do Next.js, ícones e 23 imagens. Os novos builds oferecem uma atualização do aplicativo e removem somente caches antigos deste projeto.

Abra online e aguarde **Disponível offline** antes de desligar a rede. Catálogo, fichas, fotos, filtros, comparação, favoritos e registro da escolha ficam disponíveis. IndexedDB preserva a operação; o mesmo ID é reenviado ao servidor. A apuração soma apenas votos confirmados. Uma cópia antiga do resultado é identificada como salva. Background Sync tem alternativas pela abertura, retorno online, intervalo e botão manual.

Em **Sobre**, ative **Modo apresentação** para usar uma eleição separada da principal. Para testar: preparar o offline, desligar a rede, recarregar, votar, conferir a pendência, reconectar e observar a confirmação. O enunciado pede uma gravação real; este ZIP não inclui uma gravação nem prints de DevTools.

As notificações são uma simulação local consentida com `showNotification` e clique para os resultados. Não há serviço de push remoto. A identidade é anônima por navegador, adequada à simulação educacional.

## Integrantes

- Gustavo Luis Ferreira Silva
- Gustavo Martins Ribeiro
- João Vitor Oliveira Souza
- Ryan Luca Zamboni Pedro

Web Apps - Prof. Esp. Leandro Gaudio Rosa.

## Fontes e créditos

Dados e referências das fichas: `lib/candidates.ts`. Créditos, autores e licenças das fotos: `lib/image-sources.json`. As imagens oficiais dos fabricantes mantêm seus direitos reservados; não são apresentadas como licença livre. A imagem do fundo é uma ilustração decorativa, sem modelo específico. Licenças dos estilos em `vendor`.

Documentação consultada para esta exportação:

- Vercel Drop: https://vercel.com/kb/guide/vercel-drop-vs-netlify-drop
- Next.js na Vercel: https://vercel.com/docs/frameworks/full-stack/nextjs
- Banco pelo Marketplace: https://vercel.com/docs/marketplace-storage
- Driver HTTP Neon: https://neon.com/docs/serverless/serverless-driver
