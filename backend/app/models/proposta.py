from pydantic import BaseModel
from typing import Optional


class Proposta(BaseModel):
    id: Optional[str] = None
    projeto_id: Optional[str] = None
    freelancer_id: Optional[str] = None
    descricao: Optional[str] = None
    valor: Optional[float] = None
    prazo_dias: Optional[int] = None
    status: Optional[str] = None