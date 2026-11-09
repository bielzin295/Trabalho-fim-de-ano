
from fastapi import APIRouter, HTTPException, Depends
from app.auth import autenticar_usuario
from app.schemas.perfil import PerfilCreate

router = APIRouter(
    prefix="/perfis",
    tags=["Perfis"]
)


# Listar perfis
@router.get("/")
def listar_perfis(
    usuario: dict = Depends(autenticar_usuario)
):
    try:
        resultado = (
            usuario["supabase"]
            .table("perfis")
            .select("*")
            .execute()
        )

        return resultado.data

    except Exception as erro:
        print("ERRO AO LISTAR PERFIS:", repr(erro))

        raise HTTPException(
            status_code=500,
            detail=str(erro)
        )


# Criar perfil
@router.post("/", status_code=201)
def criar_perfil(
    dados: PerfilCreate,
    usuario: dict = Depends(autenticar_usuario)
):
    print("CHEGOU NA FUNÇÃO CRIAR PERFIL!")

    try:
        perfil = {
            "id": usuario["id"],
            "nome": dados.nome,
            "email": dados.email,
            "telefone": dados.telefone,
            "tipo": dados.tipo,
            "descricao": dados.descricao,
            "valor_hora": dados.valor_hora
        }

        print("DADOS DO PERFIL PREPARADOS!")

        resultado = (
            usuario["supabase"]
            .table("perfis")
            .insert(perfil)
            .execute()
        )

        print("PERFIL CRIADO COM SUCESSO!")

        return resultado.data

    except Exception as erro:
        print("ERRO AO CRIAR PERFIL:", repr(erro))

        raise HTTPException(
            status_code=400,
            detail=str(erro)
        )


