
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from uuid import UUID

from app.auth import autenticar_usuario


router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


class MensagemCreate(BaseModel):
    conteudo: str


class ConversaCreate(BaseModel):
    projeto_id: UUID
    freelancer_id: UUID


# LISTAR CONVERSAS DO USUARIO
@router.get("/conversas")
def listar_conversas(
    usuario=Depends(autenticar_usuario)
):
    try:
        resposta = (
            usuario["supabase"]
            .table("conversas")
            .select("*")
            .execute()
        )

        return resposta.data

    except Exception as erro:
        print("ERRO AO LISTAR CONVERSAS:", repr(erro))
        raise HTTPException(
            status_code=500,
            detail="Não foi possível listar as conversas."
        )


# CRIAR OU ENCONTRAR UMA CONVERSA
@router.post("/conversas")
def criar_conversa(
    dados: ConversaCreate,
    usuario=Depends(autenticar_usuario)
):
    try:
        cliente = usuario["supabase"]
        usuario_id = usuario["id"]

        # Verifica se o usuario possui perfil
        perfil = (
            cliente.table("perfis")
            .select("tipo")
            .eq("id", usuario_id)
            .execute()
        )

        if not perfil.data:
            raise HTTPException(
                status_code=404,
                detail="Perfil do usuário não encontrado."
            )

        # Somente clientes podem iniciar conversas
        if perfil.data[0]["tipo"] != "cliente":
            raise HTTPException(
                status_code=403,
                detail="Somente clientes podem iniciar esta conversa."
            )

        projeto_id = str(dados.projeto_id)
        freelancer_id = str(dados.freelancer_id)

        # Verifica se o projeto pertence ao cliente logado
        projeto = (
            cliente.table("projetos")
            .select("id")
            .eq("id", projeto_id)
            .eq("cliente_id", usuario_id)
            .execute()
        )

        if not projeto.data:
            raise HTTPException(
                status_code=403,
                detail="Este projeto não pertence ao cliente logado."
            )

        # Verifica se o freelancer enviou proposta para o projeto
        proposta = (
            cliente.table("propostas")
            .select("id")
            .eq("projeto_id", projeto_id)
            .eq("freelancer_id", freelancer_id)
            .execute()
        )

        if not proposta.data:
            raise HTTPException(
                status_code=403,
                detail="Este freelancer ainda não enviou uma proposta para o projeto."
            )

        # Verifica se a conversa já existe
        existente = (
            cliente.table("conversas")
            .select("*")
            .eq("projeto_id", projeto_id)
            .eq("cliente_id", usuario_id)
            .eq("freelancer_id", freelancer_id)
            .execute()
        )

        if existente.data:
            return existente.data[0]

        # Cria a conversa
        resposta = (
            cliente.table("conversas")
            .insert({
                "projeto_id": projeto_id,
                "cliente_id": usuario_id,
                "freelancer_id": freelancer_id
            })
            .execute()
        )

        if not resposta.data:
            raise HTTPException(
                status_code=400,
                detail="Não foi possível criar a conversa."
            )

        return resposta.data[0]

    except HTTPException:
        raise

    except Exception as erro:
        print("ERRO AO CRIAR CONVERSA:", repr(erro))
        raise HTTPException(
            status_code=400,
            detail="Não foi possível criar a conversa."
        )


# LISTAR MENSAGENS DE UMA CONVERSA
@router.get("/conversas/{conversa_id}/mensagens")
def listar_mensagens(
    conversa_id: UUID,
    usuario=Depends(autenticar_usuario)
):
    try:
        cliente = usuario["supabase"]

        # Verifica se o usuario participa da conversa
        conversa = (
            cliente.table("conversas")
            .select("id")
            .eq("id", str(conversa_id))
            .execute()
        )

        if not conversa.data:
            raise HTTPException(
                status_code=404,
                detail="Conversa não encontrada."
            )

        # Carrega as mensagens em ordem de envio
        resposta = (
            cliente.table("mensagens")
            .select("*")
            .eq("conversa_id", str(conversa_id))
            .order("enviado_em")
            .execute()
        )

        return resposta.data

    except HTTPException:
        raise

    except Exception as erro:
        print("ERRO AO LISTAR MENSAGENS:", repr(erro))
        raise HTTPException(
            status_code=500,
            detail="Não foi possível carregar as mensagens."
        )


# ENVIAR MENSAGEM
@router.post("/conversas/{conversa_id}/mensagens")
def enviar_mensagem(
    conversa_id: UUID,
    dados: MensagemCreate,
    usuario=Depends(autenticar_usuario)
):
    try:
        cliente = usuario["supabase"]
        conteudo = dados.conteudo.strip()

        if not conteudo:
            raise HTTPException(
                status_code=400,
                detail="A mensagem não pode estar vazia."
            )

        # Verifica se o usuario participa da conversa
        conversa = (
            cliente.table("conversas")
            .select("id")
            .eq("id", str(conversa_id))
            .execute()
        )

        if not conversa.data:
            raise HTTPException(
                status_code=404,
                detail="Conversa não encontrada."
            )

        # Salva a mensagem
        resposta = (
            cliente.table("mensagens")
            .insert({
                "conversa_id": str(conversa_id),
                "remetente_id": usuario["id"],
                "conteudo": conteudo
            })
            .execute()
        )

        if not resposta.data:
            raise HTTPException(
                status_code=400,
                detail="Não foi possível enviar a mensagem."
            )

        return resposta.data[0]

    except HTTPException:
        raise

    except Exception as erro:
        print("ERRO AO ENVIAR MENSAGEM:", repr(erro))
        raise HTTPException(
            status_code=400,
            detail="Não foi possível enviar a mensagem."
        )
