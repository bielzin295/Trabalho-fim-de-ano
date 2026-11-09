from pydantic import BaseModel
from typing import Optional


class Perfil(BaseModel):
    id: Optional[str] = None
    Nome: Optional[str] = None
    Email: Optional[str] = None
    Telefone: Optional[str] = None
    Tipo: Optional[str] = None
    Descrição: Optional[str] = None