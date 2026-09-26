# Arquitetura da console

## Organização

- `index.html`: estrutura semântica das telas e pontos de montagem dos componentes.
- `css/styles.css`: tokens visuais, componentes, responsividade e tema escuro ativado por `body[data-theme]`.
- `js/app.js`: dados simulados, navegação entre vistas, renderização, filtros, cadastro, CSV, alertas, preferências e atualização periódica.
- `.github/workflows/pages.yml`: publicação estática automatizada no GitHub Pages.

## Bibliotecas externas

- **Chart.js 4.4.9**: gráfico de linha responsivo, com tooltip e escalas temáticas.
- **Lucide**: ícones da interface.
- **Google Fonts**: Manrope e DM Mono.

As bibliotecas são carregadas por CDN no HTML. Uma conexão de internet é necessária para esses recursos externos. Não existe build step nem servidor de aplicação.

## Dados e operação

Todos os registros de servidor e alerta são exemplos mantidos em memória pelo JavaScript. Os valores de atualização automática são simulados aleatoriamente; eles não representam telemetria real. Não há API, banco de dados, autenticação ou integração com hardware.

Para transformar a console em monitoramento real, será necessário implementar um backend autenticado, contratos de telemetria e alertas, armazenamento, autorização por perfil e validação de segurança. Credenciais ou chaves de infraestrutura nunca devem ser incluídas nos arquivos estáticos publicados.
