from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.api import router
from app.config import settings

app = FastAPI(title="iyagi-backend", version="0.1.0")
app.include_router(router)


@app.get("/healthz")
def healthz() -> dict:
    return {
        "status": "ok",
        "service": settings.app_name,
        "env": settings.app_env,
    }


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    if isinstance(exc, KeyError):
        return JSONResponse(status_code=404, content={"ok": False, "error": {"code": "not_found", "message": str(exc)}})
    return JSONResponse(
        status_code=500,
        content={"ok": False, "error": {"code": "internal_error", "message": "Internal server error"}},
    )
