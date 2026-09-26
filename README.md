# Northstar Infrastructure

Console web responsiva para monitoramento demonstrativo de um data center, inspirada na imagem de referência. A interface está em português e inclui visão geral, inventário de servidores, alertas, infraestrutura, registro de atividade, modo escuro e gráficos com Chart.js.

> **Importante:** os indicadores são dados simulados no navegador. Esta aplicação ainda não consulta servidores, sensores, APIs ou ferramentas de monitoramento reais e não deve ser usada como sistema operacional de produção.

## Estrutura

```text
.
├── index.html                 # Estrutura e conteúdo da interface
├── css/
│   └── styles.css             # Estilos, responsividade e tema escuro
├── js/
│   └── app.js                 # Interações e dados demonstrativos
├── docs/
│   ├── ARQUITETURA.md         # Organização e tecnologias
│   └── PUBLICACAO.md          # Publicação local e GitHub Pages
└── .github/workflows/
    └── pages.yml              # Deploy automático no GitHub Pages
```

O pedido mencionava “Java”; esta console não tem código Java. A lógica do navegador está escrita em **JavaScript**.

## Abrir localmente

Abra `index.html` no navegador. Chart.js, Lucide e as fontes tipográficas são carregados por CDN, portanto os gráficos, ícones e fontes externas precisam de conexão à internet. A interface não exige instalação ou compilação.

## Publicar no GitHub Pages

1. Crie um repositório **público** no GitHub e envie o conteúdo deste projeto para a branch `main`.
2. No repositório, abra **Settings → Pages** e selecione **GitHub Actions** como origem de publicação, caso isso ainda não esteja selecionado.
3. O workflow em `.github/workflows/pages.yml` será executado no primeiro envio à `main`. Acompanhe o resultado em **Actions**.
4. Após a conclusão, o endereço terá o formato `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`. O GitHub também mostra o URL exato em **Settings → Pages**.

O workflow pode ser iniciado manualmente pela aba **Actions** usando `Deploy to GitHub Pages`.

## Funcionalidades

- Métricas de CPU, disponibilidade de servidores e alertas.
- Gráfico interativo com Chart.js, métricas de CPU/memória/rede e períodos de 24 horas, 7 dias e 30 dias.
- Inventário com busca, filtros por status e rack, cadastro em memória e exportação CSV.
- Reconhecimento e reabertura de alertas.
- Modo escuro persistente no navegador.
- Layout adaptável a telas móveis.

O inventário cadastrado e as alterações de alertas existem somente na sessão atual; não há backend nem persistência de dados operacionais.
