# Publicação

## GitHub Pages com Actions

O repositório deve conter o site estático na raiz, com `index.html`, `css/` e `js/`. O workflow `Deploy to GitHub Pages` é acionado em push para `main` ou manualmente na aba **Actions**.

Na primeira configuração, abra **Settings → Pages** e escolha **GitHub Actions** como origem. O workflow empacota a raiz do projeto e publica o artefato estático.

Quando a execução terminar com sucesso, o URL ficará disponível em **Settings → Pages**. Para um repositório de projeto, normalmente segue o padrão `https://USUARIO.github.io/REPOSITORIO/`; para o repositório especial do usuário, `https://USUARIO.github.io/`.

## Fluxo local com Git

Instale o Git e autentique-se no GitHub pela ferramenta de sua preferência. Em seguida, conecte a pasta a um repositório vazio e envie a branch principal:

```powershell
git init
git add .
git commit -m "Prepare Northstar for GitHub Pages"
git branch -M main
git remote add origin https://github.com/USUARIO/REPOSITORIO.git
git push -u origin main
```

Substitua `USUARIO` e `REPOSITORIO` pelos valores reais. Não inclua tokens, senhas ou credenciais no remoto ou nos arquivos do projeto.

## Antes de compartilhar

- Aguarde o workflow terminar sem falhas.
- Abra o URL apresentado em **Settings → Pages** em uma janela anônima.
- Confirme navegação, gráficos, responsividade e carregamento das bibliotecas externas.
- Lembre que esta versão contém dados demonstrativos e não monitora infraestrutura real.
