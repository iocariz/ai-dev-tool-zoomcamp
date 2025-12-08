from typing import Dict, List
from .models import ActivePlayer

# In-memory storage for active games (live state doesn't need to be in DB yet)
active_games: Dict[str, ActivePlayer] = {}
