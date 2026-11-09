import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# Carrega as informações do arquivo .env
load_dotenv(Path(__file__).resolve().parent / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Configure SUPABASE_URL e SUPABASE_KEY no arquivo .env")

# Cria a conexão com o Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
