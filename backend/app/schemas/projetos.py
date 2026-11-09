
from pydantic import BaseModel
from typing import Optional


class ProjetoCreate(BaseModel):
    titulo: str
    descricao: str
    categoria: Optional[str] = None
    orcamento: Optional[float] = None
