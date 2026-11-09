from pydantic import BaseModel
from typing import Optional


class PerfilCreate(BaseModel):
    nome: str
    email: str
    telefone: Optional[str] = None
    tipo: str
    descricao: Optional[str] = None
    valor_hora: Optional[float] = None