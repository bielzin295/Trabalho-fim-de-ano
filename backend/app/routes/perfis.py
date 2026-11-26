
import uuid
import traceback

from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
    UploadFile,
    File
)

from app.auth import autenticar_usuario
from app.schemas.perfil import PerfilCreate
from supabase_client import supabase


router = APIRouter(
    prefix="/perfis",
    tags=["Perfis"]
)


# LISTAR FREELANCERS PUBLICAMENTE
@router.get("/freelancers")
def listar_freelancers():
    try:
        resultado = (
            supabase
            .table("freelancers_publicos")
            .select("id, nome, descricao, valor_hora")
            .execute()
        )

        return resultado.data

    except Exception as erro:
        print("ERRO AO LISTAR FREELANCERS:", repr(erro))

        raise HTTPException(
            status_code=500,
            detail="Não foi possível listar os freelancers."
        )


# LISTAR PERFIS DO USUARIO AUTENTICADO
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


# CRIAR PERFIL
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
        traceback.print_exc()

        raise HTTPException(
            status_code=400,
            detail=str(erro)
        )


# ENVIAR FOTO DE PERFIL
@router.post("/foto")
async def enviar_foto_perfil(
    arquivo: UploadFile = File(...),
    usuario: dict = Depends(autenticar_usuario)
):
    try:
        print("INICIANDO ENVIO DA FOTO DE PERFIL")

        # FORMATOS PERMITIDOS
        tipos_permitidos = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp"
        }

        if arquivo.content_type not in tipos_permitidos:
            raise HTTPException(
                status_code=400,
                detail="Formato inválido. Envie JPG, PNG ou WEBP."
            )

        # LER IMAGEM
        conteudo = await arquivo.read()

        # LIMITE DE 5 MB
        limite = 5 * 1024 * 1024

        if not conteudo:
            raise HTTPException(
                status_code=400,
                detail="O arquivo está vazio."
            )

        if len(conteudo) > limite:
            raise HTTPException(
                status_code=400,
                detail="A imagem deve ter no máximo 5 MB."
            )

        print("IMAGEM VALIDADA COM SUCESSO")

        # IDENTIFICAR USUARIO
        usuario_id = usuario["id"]

        extensao = tipos_permitidos[arquivo.content_type]

        nome_arquivo = (
            f"{usuario_id}/{uuid.uuid4()}.{extensao}"
        )

        cliente = usuario["supabase"]

        # ENVIAR IMAGEM PARA O STORAGE
        print("ENVIANDO IMAGEM PARA O SUPABASE STORAGE")

        cliente.storage.from_("fotos-perfil").upload(
            nome_arquivo,
            conteudo,
            file_options={
                "content-type": arquivo.content_type
            }
        )

        print("IMAGEM ENVIADA AO STORAGE COM SUCESSO")

        # GERAR URL PUBLICA
        foto_url = cliente.storage.from_(
            "fotos-perfil"
        ).get_public_url(nome_arquivo)

        print("URL PUBLICA GERADA")

        # ATUALIZAR FOTO NA TABELA PERFIS
        print("ATUALIZANDO FOTO NA TABELA PERFIS")

        resultado = (
            cliente
            .table("perfis")
            .update({
                "foto_url": foto_url
            })
            .eq("id", usuario_id)
            .execute()
        )

        if not resultado.data:
            raise HTTPException(
                status_code=404,
                detail="Perfil não encontrado ou atualização não permitida."
            )

        print("FOTO DE PERFIL SALVA COM SUCESSO")

        return {
            "mensagem": "Foto de perfil enviada com sucesso!",
            "foto_url": foto_url
        }

    except HTTPException:
        raise

    except Exception as erro:
        print("\nERRO AO ENVIAR FOTO:", repr(erro))
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail="Não foi possível enviar a foto de perfil."
        )
