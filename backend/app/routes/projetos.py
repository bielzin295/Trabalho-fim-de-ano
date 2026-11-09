
from fastapi import APIRouter, HTTPException, Depends

from app.auth import autenticar_usuario
from app.schemas.projetos import ProjetoCreate


router = APIRouter(
    prefix="/projetos",
    tags=["Projetos"]
)


# Listar projetos
@router.get("/")
def listar_projetos(
    usuario: dict = Depends(autenticar_usuario)
):
    try:
        resultado = (
            usuario["supabase"]
            .table("projetos")
            .select("*")
            .execute()
        )

        return resultado.data

    except Exception as erro:
        raise HTTPException(
            status_code=500,
            detail=str(erro)
        )


# Criar projeto
@router.post("/", status_code=201)
def criar_projeto(
    dados: ProjetoCreate,
    usuario: dict = Depends(autenticar_usuario)
):
    try:
        projeto = {
            "cliente_id": usuario["id"],
            "titulo": dados.titulo,
            "descricao": dados.descricao,
            "categoria": dados.categoria,
            "orcamento": dados.orcamento,
            "status": "aberto"
        }

        resultado = (
            usuario["supabase"]
            .table("projetos")
            .insert(projeto)
            .execute()
        )

        return resultado.data

    except Exception as erro:
        raise HTTPException(
            status_code=400,
            detail=str(erro)
        )
