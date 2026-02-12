# CRUD Auth NestJS - Sistema de Gestão de Artigos e Usuários

Este é um projeto robusto desenvolvido com **NestJS**, **Prisma**, e **MySQL/MariaDB**, focado em autenticação e controle de acesso baseado em cargos (RBAC).

## 🚀 Requisitos Mínimos

- **Node.js** v18+
- **Docker** e **Docker Compose**
- **NPM** ou **Yarn**

## 🛠️ Instalação e Bootstrap

O projeto está configurado para subir completamente usando Docker, o que inclui o banco de dados e a execução automática de migrations e seeds (permissões e usuário root).

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/Frederico03/crud-auth-nest.git
   cd crud-auth-nest
   ```

2. **Configurar variáveis de ambiente:**
   Copie o arquivo `.env.example` para `.env` e ajuste se necessário (o padrão já funciona com Docker).
   ```bash
   cp .env.example .env
   ```

3. **Subir os containers:**
   ```bash
   docker compose up --build
   ```

Este comando irá:
- Iniciar o banco MySQL/MariaDB na porta **3307**.
- Executar o `prisma generate` para gerar o cliente.
- Executar o `prisma migrate` para criar as tabelas.
- Executar o `seed.ts` para criar o usuário root (`user@example.com` / `password`) e as permissões padrão.
- Iniciar a aplicação na porta **3000**.

## 📖 Documentação da API (Swagger)

A API possui documentação interativa através do Swagger. Você pode acessar, visualizar e testar todos os endpoints em:

🔗 **`http://localhost:3000/api`**

---

## 🔐 Níveis de Permissão

- **ADMIN**: Gestão total (Usuários e Artigos). Pode alterar cargos de outros usuários.
- **EDITOR**: Gestão total de Artigos. Sem acesso à gestão de usuários.
- **READER**: Acesso de leitura apenas para Artigos.

---

## 📡 Endpoints: Documentação Detalhada

### 1. Autenticação

#### [POST] `/auth/login`
Gera o token JWT para acesso aos endpoints protegidos.

- **Permissão:** Público
- **Payload Swagger:**
  ```json
  {
    "email": "user@example.com",
    "password": "password"
  }
  ```
- **cURL:**
  ```bash
  curl -X POST http://localhost:3000/auth/login \
       -H "Content-Type: application/json" \
       -d '{"email": "user@example.com", "password": "password"}'
  ```

---

### 2. Gestão de Usuários

#### [POST] `/users`
Cria um novo usuário.
- **Permissão:** `ADMIN`
- **Payload Swagger:**
  ```json
  {
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "password123"
  }
  ```
- **cURL:**
  ```bash
  curl -X POST http://localhost:3000/users \
       -H "Authorization: Bearer <TOKEN>" \
       -H "Content-Type: application/json" \
       -d '{"name": "João Silva", "email": "joao@example.com", "password": "password123"}'
  ```

#### [GET] `/users`
Lista todos os usuários.
- **Permissão:** `ADMIN`
- **cURL:** `curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/users`

#### [GET] `/users/{id}`
Busca detalhes de um usuário.
- **Permissão:** `ADMIN` ou o próprio usuário (`SELF`)
- **ID Swagger:** `2`
- **cURL:** `curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/users/2`

#### [PATCH] `/users/{id}`
Atualiza dados do usuário.
- **Permissão:** `ADMIN` ou o próprio usuário (`SELF`)
- **Payload Swagger:**
  ```json
  {
    "name": "João Silva Atualizado",
    "password": "newpassword123"
  }
  ```
- **cURL:**
  ```bash
  curl -X PATCH http://localhost:3000/users/2 \
       -H "Authorization: Bearer <TOKEN>" \
       -H "Content-Type: application/json" \
       -d '{"name": "João Silva Atualizado"}'
  ```

#### [DELETE] `/users/{id}`
Remove um usuário e seus dados vinculados (Artigos/Permissões).
- **Permissão:** `ADMIN` ou o próprio usuário (`SELF`)
- **cURL:** `curl -X DELETE -H "Authorization: Bearer <TOKEN>" http://localhost:3000/users/2`

#### [PATCH] `/users/{id}/role`
Altera o cargo/permissão de um usuário entre `READER` e `EDITOR`.
- **Permissão:** `ADMIN`
- **Payload Swagger:**
  ```json
  {
    "role": "EDITOR"
  }
  ```
- **cURL:**
  ```bash
  curl -X PATCH http://localhost:3000/users/2/role \
       -H "Authorization: Bearer <TOKEN_ADMIN>" \
       -H "Content-Type: application/json" \
       -d '{"role": "EDITOR"}'
  ```

---

### 3. Gestão de Artigos

#### [POST] `/articles`
Cria um novo artigo.
- **Permissão:** `ADMIN`, `EDITOR`
- **Payload Swagger:**
  ```json
  {
    "title": "Título do Artigo",
    "content": "Conteúdo detalhado do artigo."
  }
  ```
- **cURL:**
  ```bash
  curl -X POST http://localhost:3000/articles \
       -H "Authorization: Bearer <TOKEN>" \
       -H "Content-Type: application/json" \
       -d '{"title": "Título do Artigo", "content": "Conteúdo detalhado."}'
  ```

#### [GET] `/articles`
Lista todos os artigos.
- **Permissão:** `ADMIN`, `EDITOR`, `READER`
- **cURL:** `curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/articles`

#### [GET] `/articles/{id}`
Busca um artigo específico.
- **Permissão:** `ADMIN`, `EDITOR`, `READER`
- **cURL:** `curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/articles/1`

#### [PATCH] `/articles/{id}`
Atualiza um artigo.
- **Permissão:** `ADMIN`, `EDITOR`
- **Payload Swagger:**
  ```json
  {
    "title": "Novo Título",
    "content": "Conteúdo atualizado."
  }
  ```
- **cURL:**
  ```bash
  curl -X PATCH http://localhost:3000/articles/1 \
       -H "Authorization: Bearer <TOKEN>" \
       -H "Content-Type: application/json" \
       -d '{"title": "Novo Título"}'
  ```

#### [DELETE] `/articles/{id}`
Remove um artigo.
- **Permissão:** `ADMIN`, `EDITOR`
- **cURL:** `curl -X DELETE -H "Authorization: Bearer <TOKEN>" http://localhost:3000/articles/1`

---

## 🧪 Testes Automatizados

**Unitários:** `npm run test`
**E2E (RBAC Verification):** `npm run test:e2e`

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).
