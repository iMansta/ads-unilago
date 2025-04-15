# Atlética de ADS Unilago

Este é o repositório do projeto da Atlética de Análise e Desenvolvimento de Sistemas da Unilago.

## Estrutura do Projeto

O projeto está organizado em duas partes principais:

- **Frontend**: Contém os arquivos HTML, CSS e JavaScript para a interface do usuário.
- **Backend**: Contém o código do servidor Node.js com Express e MongoDB.

## Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Autenticação**: JWT (JSON Web Tokens)
- **Deploy**: Render

## Configuração do Ambiente de Desenvolvimento

### Pré-requisitos

- Node.js (v14 ou superior)
- MongoDB (local ou Atlas)
- Git

### Instalação

1. Clone o repositório:
   ```
   git clone https://github.com/seu-usuario/atletica-ads-unilago.git
   cd atletica-ads-unilago
   ```

2. Instale as dependências do backend:
   ```
   cd backend
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na pasta `backend` com as seguintes variáveis:
     ```
     MONGODB_URI=sua_uri_do_mongodb
     JWT_SECRET=seu_segredo_jwt
     PORT=3000
     NODE_ENV=development
     ```

4. Inicie o servidor de desenvolvimento:
   ```
   npm run dev
   ```

5. Acesse o frontend abrindo os arquivos HTML diretamente no navegador ou usando um servidor local.

## Deploy

O projeto está configurado para ser implantado no Render. Para fazer o deploy:

1. Crie uma conta no Render (https://render.com)
2. Conecte seu repositório GitHub
3. Crie um novo Web Service
4. Configure as variáveis de ambiente necessárias
5. Deploy!

## Funcionalidades

- Autenticação de usuários (login/registro)
- Feed de posts
- Comentários em posts
- Perfil de usuário
- Grupos
- Eventos
- Notificações
- Tema claro/escuro
- Design responsivo

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.

## Contato

Para mais informações, entre em contato com a equipe da Atlética de ADS Unilago. 