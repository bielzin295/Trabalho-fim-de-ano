# Documentação da API — Freelancer

## 1. Informações gerais

- **Tecnologia:** Python e FastAPI
- **Banco de dados:** Supabase
- **Formato das requisições:** JSON
- **Endereço local:** http://127.0.0.1:8000
- **Documentação interativa:** http://127.0.0.1:8000/docs

## 2. Autenticação

O sistema utiliza o Supabase Auth para cadastrar e autenticar usuários.

As rotas protegidas precisam receber o token de acesso no cabeçalho:

`Authorization: Bearer TOKEN`

O token é obtido pela rota de login.

## 3. Rotas disponíveis

### Cadastro

**POST /cadastro**

Cria uma conta de usuário no Supabase Auth.

Recebe:
- nome
- email
- senha
- telefone
- tipo
- descricao
- valor_hora

O usuário precisa confirmar o e-mail quando essa opção está habilitada no Supabase.

### Login

**POST /login**

Realiza a autenticação do usuário.

Recebe:
- email
- senha

Retorna:
- access_token
- token_type

### Perfis

**GET /perfis/**

Lista os perfis permitidos pelas políticas de segurança do banco.

**POST /perfis/**

Cria um perfil vinculado ao usuário autenticado.

Recebe:
- nome
- email
- telefone
- tipo
- descricao
- valor_hora

O ID do perfil é obtido automaticamente pelo usuário autenticado.

### Projetos

**GET /projetos/**

Lista os projetos permitidos pelas políticas de segurança.

**POST /projetos/**

Cadastra um novo projeto.

Recebe:
- titulo
- descricao
- categoria
- orcamento

Exemplo:

```json
{
  "titulo": "Desenvolvimento de site",
  "descricao": "Criar um site para uma empresa",
  "categoria": "Programação",
  "orcamento": 1500
}
```

O projeto fica vinculado ao cliente autenticado.

### Propostas

**GET /propostas/**

Lista as propostas permitidas pelas políticas de segurança.

**POST /propostas/**

Cadastra uma proposta para um projeto.

Os campos da requisição estão definidos no schema PropostaCreate do Swagger.

**PATCH /propostas/{proposta_id}/status**

Atualiza o status de uma proposta.

Os campos e valores aceitos estão definidos no schema PropostaStatus do Swagger.

## 4. Rotas de teste

**GET /**

Verifica se o backend está funcionando.

**GET /teste-supabase**

Testa a conexão entre o backend e o Supabase.

## 5. Segurança

- O banco de dados