
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal


class CadastroCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str = Field(min_length=8)
    telefone: Optional[str] = None
    tipo: Literal["cliente", "freelancer"]
    descricao: Optional[str] = None
    valor_hora: Optional[float] = None
