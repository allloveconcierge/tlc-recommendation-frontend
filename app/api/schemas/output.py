from pydantic import BaseModel


class Healthcheck(BaseModel):
    """Healthcheck response"""

    isAlive: bool
