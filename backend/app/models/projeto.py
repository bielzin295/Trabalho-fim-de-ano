from pydantic import BaseModel
from typing import Optional


class Projeto(BaseModel):
    id: Optional[str] = None
    cliente_id: Optional[str] = None
    titulo: Optional[str] = None
    descricao: Optional[str] = None
    status: Optional[str] = None