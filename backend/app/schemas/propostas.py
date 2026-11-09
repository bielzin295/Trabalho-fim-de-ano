
from pydantic import BaseModel
from typing import Optional, Literal


class PropostaCreate(BaseModel):
    projeto_id: str
    descricao: str
    valor: float
    prazo_dias: Optional[int] = None


class PropostaStatus(BaseModel):
    status: Literal["aceita", "recusada"]
