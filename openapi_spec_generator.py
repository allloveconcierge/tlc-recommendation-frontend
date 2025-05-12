import json

from app.asgi import app


if __name__ == "__main__":

    openapi_content = app.openapi()

    with open("openapi.json", "w", encoding="UTF-8") as f:
        json.dump(openapi_content, f, indent=4)
