
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from supabase_client import supabase

from app.routes.perfis import router as perfis_router
from app.routes.projetos import router as projetos_router
from app.routes.propostas import router as propostas_router

from app.schemas.cadastro import CadastroCreate


app = FastAPI(title="API do Trabalho")


# CONFIGURACAO DO CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://127.0.0.1:3000",
        "http://localhost:3000",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# MODELO DE LOGIN
class LoginRequest(BaseModel):
    email: str
    senha: str


# ROTA INICIAL
@app.get("/")
def inicio():
    return {"mensagem": "API funcionando!"}


# TESTE DE CONEXAO COM SUPABASE
@app.get("/teste-supabase")
def teste_supabase():
    try:
        resposta = (
            supabase.table("perfis")
            .select("*")
            .limit(1)
            .execute()
        )

        return {
            "mensagem": "Conexao com Supabase funcionando!",
            "dados": resposta.data
        }

    except Exception as erro:
        print("ERRO NO TESTE SUPABASE:", repr(erro))

        raise HTTPException(
            status_code=500,
            detail="Erro ao conectar com o Supabase."
        )


# CONTAR FREELANCERS
@app.get("/contagem-freelancers")
def contagem_freelancers():
    try:
        resposta = supabase.rpc(
            "contar_freelancers"
        ).execute()

        return {
            "total_freelancers": resposta.data
        }

    except Exception as erro:
        print("ERRO AO CONTAR FREELANCERS:", repr(erro))

        raise HTTPException(
            status_code=500,
            detail="Nao foi possivel contar os freelancers."
        )


# CADASTRO
@app.post("/cadastro", status_code=201)
def cadastro(dados: CadastroCreate):
    try:
        # Criar conta no Supabase Auth
        resposta = supabase.auth.sign_up({
            "email": dados.email,
            "password": dados.senha,
            "options": {
                "data": {
                    "nome": dados.nome,
                    "telefone": dados.telefone,
                    "tipo": dados.tipo,
                    "descricao": dados.descricao,
                    "valor_hora": (
                        str(dados.valor_hora)
                        if dados.valor_hora is not None
                        else None
                    )
                }
            }
        })

        if not resposta.user:
            raise Exception(
                "Supabase nao retornou os dados do usuario."
            )

        return {
            "mensagem": "Conta criada com sucesso!",
            "usuario_id": resposta.user.id,
            "perfil_criado": (
                "O perfil sera criado automaticamente pelo Supabase."
            )
        }

    except Exception as erro:
        print("ERRO NO CADASTRO:", repr(erro))

        raise HTTPException(
            status_code=400,
            detail=f"Erro no cadastro: {str(erro)}"
        )


# LOGIN
@app.post("/login")
def login(dados: LoginRequest):
    try:
        resposta = supabase.auth.sign_in_with_password({
            "email": dados.email,
            "password": dados.senha
        })

        if not resposta.session:
            raise Exception(
                "Supabase nao retornou uma sessao de login."
            )

        return {
            "mensagem": "Login realizado com sucesso!",
            "access_token": resposta.session.access_token,
            "refresh_token": resposta.session.refresh_token,
            "token_type": "bearer"
        }

    except Exception as erro:
        print("ERRO NO LOGIN:", repr(erro))

        raise HTTPException(
            status_code=401,
            detail="Nao foi possivel realizar o login."
        )


# ROTAS DO SISTEMA
app.include_router(perfis_router)
app.include_router(projetos_router)
app.include_router(propostas_router)
