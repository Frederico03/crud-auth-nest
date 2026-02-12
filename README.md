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

| Cargo | Descrição |
| :--- | :--- |
| **ADMIN** | Gestão total (Usuários e Artigos). Pode alterar cargos de outros usuários. |
| **EDITOR** | Gestão total de Artigos. Não possui acesso à gestão de usuários. |
| **READER** | Acesso de leitura apenas para Artigos. |

---

## 📡 Endpoints Principais e Fluxo de Uso

### 1. Autenticação (Login)
Para qualquer operação protegida, você deve obter um token JWT.

**Fluxo:**
1. Chame o endpoint de login.
2. Utilize o `access_token` retornado no header `Authorization: Bearer <token>`.

**cURL:**
```bash
curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com", "password": "password"}'
```

### 2. Gestão de Cargos (Admin Only)
Endpoint para alterar a permissão de um usuário entre `READER` e `EDITOR`.

**cURL:**
```bash
curl -X PATCH http://localhost:3000/users/2/role \
     -H "Authorization: Bearer <TOKEN_ADMIN>" \
     -H "Content-Type: application/json" \
     -d '{"role": "EDITOR"}'
```

### 3. Gestão de Artigos
Operações de CRUD para artigos.

**Fluxo de Criação (Admin/Editor):**
```bash
curl -X POST http://localhost:3000/articles \
     -H "Authorization: Bearer <TOKEN_JWT>" \
     -H "Content-Type: application/json" \
     -d '{"title": "Meu Primeiro Artigo", "content": "Conteúdo de alta qualidade."}'
```

**Listagem (Qualquer usuário logado):**
```bash
curl -X GET http://localhost:3000/articles \
     -H "Authorization: Bearer <TOKEN_JWT>"
```

---

## 🧪 Testes Automatizados

O projeto conta com uma suíte de testes unitários e de integração (E2E) utilizando **Jest**.

**Rodar testes unitários:**
```bash
npm run test
```

**Rodar testes E2E (Simulação de chamadas reais e permissões):**
```bash
npm run test:e2e
```

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).
