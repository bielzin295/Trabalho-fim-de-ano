
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client

from supabase_client import supabase, SUPABASE_URL, SUPABASE_KEY

security = HTTPBearer(auto_error=False)


def autenticar_usuario(
    credenciais: HTTPAuthorizationCredentials = Depends(security)
):
    if not credenciais:
        raise HTTPException(
            status_code=401,
            detail="Token de autenticação não informado."
        )

    token = credenciais.credentials

    try:
        usuario = supabase.auth.get_user(token)

        if not usuario or not usuario.user:
            raise HTTPException(
                status_code=401,
                detail="Token inválido."
            )

        cliente = create_client(SUPABASE_URL, SUPABASE_KEY)
        cliente.postgrest.auth(token)

        return {
            "id": usuario.user.id,
            "supabase": cliente
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Não foi possível autenticar o usuário."
        )
