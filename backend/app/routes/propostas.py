
from fastapi import APIRouter, HTTPException, Depends

from app.auth import autenticar_usuario
from app.schemas.propostas import PropostaCreate, PropostaStatus


router = APIRouter(
    prefix="/propostas",
    tags=["Propostas"]
)


# Listar propostas
@router.get("/")
def listar_propostas(
    usuario: dict = Depends(autenticar_usuario)
):
    try:
        resultado = (
            usuario["supabase"]
            .table("propostas")
            .select("*")
            .execute()
        )

        return resultado.data

    except Exception as erro:
        print("ERRO AO LISTAR PROPOSTAS:", repr(erro))
        raise HTTPException(
            status_code=500,
            detail="Erro ao listar propostas."
        )


# Criar proposta
@router.post("/", status_code=201)
def criar_proposta(
    dados: PropostaCreate,
    usuario: dict = Depends(autenticar_usuario)
):
    try:
        proposta = {
            "projeto_id": dados.projeto_id,
            "freelancer_id": usuario["id"],
            "descricao": dados.descricao,
            "valor": dados.valor,
            "prazo_dias": dados.prazo_dias,
            "status": "pendente"
        }

        resultado = (
            usuario["supabase"]
            .table("propostas")
            .insert(proposta)
            .execute()
        )

        return resultado.data

    except Exception as erro:
        print("ERRO AO CRIAR PROPOSTA:", repr(erro))
        raise HTTPException(
            status_code=400,
            detail="Erro ao criar proposta."
        )


# Aceitar ou recusar proposta
@router.patch("/{proposta_id}/status")
def atualizar_status_proposta(
    proposta_id: str,
    dados: PropostaStatus,
    usuario: dict = Depends(autenticar_usuario)
):
    try:
        resultado = (
            usuario["supabase"]
            .table("propostas")
            .update({"status": dados.status})
            .eq("id", proposta_id)
            .execute()
        )

        if not resultado.data:
            raise HTTPException(
                status_code=404,
                detail="Proposta não encontrada ou você não tem permissão para alterá-la."
            )

        return resultado.data

    except HTTPException:
        raise

    except Exception as erro:
        print("ERRO AO ATUALIZAR PROPOSTA:", repr(erro))
        raise HTTPException(
            status_code=400,
            detail="Erro ao atualizar proposta."
        )
