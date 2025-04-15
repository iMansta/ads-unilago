# Backend da Rede Social da Atlética de ADS Unilago

Este é o backend da rede social da Atlética de Análise e Desenvolvimento de Sistemas da Unilago.

## Tecnologias Utilizadas

- Node.js
- Express
- MongoDB
- JWT para autenticação
- Multer para upload de arquivos

## Requisitos

- Node.js (v14 ou superior)
- MongoDB (v4.4 ou superior)
- NPM ou Yarn

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/unilago.git
cd unilago/backend
```

2. Instale as dependências:
```bash
npm install
```

3. Crie um arquivo .env na raiz do projeto com as seguintes variáveis:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/unilago
JWT_SECRET=seu_jwt_secret_aqui
NODE_ENV=development
```

4. Inicie o servidor:
```bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm start
```

## Estrutura do Projeto

```
backend/
├── config/         # Configurações do banco de dados
├── controllers/    # Controladores da aplicação
├── middleware/     # Middlewares
├── models/         # Modelos do MongoDB
├── routes/         # Rotas da API
├── uploads/        # Arquivos enviados pelos usuários
├── validators/     # Validadores de dados
├── .env           # Variáveis de ambiente
├── .gitignore     # Arquivos ignorados pelo Git
├── package.json   # Dependências e scripts
└── server.js      # Arquivo principal do servidor
```

## API Endpoints

### Autenticação
- POST /api/auth/register - Registrar um novo usuário
- POST /api/auth/login - Login de usuário

### Usuários
- GET /api/users - Listar todos os usuários
- GET /api/users/:id - Obter um usuário específico
- PUT /api/users/:id - Atualizar um usuário
- DELETE /api/users/:id - Deletar um usuário

### Posts
- GET /api/posts - Listar todos os posts
- GET /api/posts/:id - Obter um post específico
- POST /api/posts - Criar um novo post
- PUT /api/posts/:id - Atualizar um post
- DELETE /api/posts/:id - Deletar um post
- POST /api/posts/:id/like - Curtir/descurtir um post

### Comentários
- GET /api/comments/post/:postId - Listar comentários de um post
- POST /api/comments - Criar um novo comentário
- PUT /api/comments/:id - Atualizar um comentário
- DELETE /api/comments/:id - Deletar um comentário
- POST /api/comments/:id/like - Curtir/descurtir um comentário

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. 