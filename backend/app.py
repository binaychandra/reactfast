# mypy: disable - error - code = "no-untyped-def,misc"
import pathlib
from fastapi import FastAPI, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Define the FastAPI app
app = FastAPI()

# --- Simple API endpoint ---
class TextIn(BaseModel):
    text: str


@app.post("/api/transform")
def transform_text(payload: TextIn):
    # Minimal transformation: uppercase with a prefix
    modified = f"Hello, {payload.text}"
    return {"result": modified}


def create_frontend_router(build_dir="frontend/dist"):
    """Creates a router to serve the React frontend.

    Args:
        build_dir: Path to the React build directory relative to this file.

    Returns:
        A Starlette application serving the frontend.
    """
    # Resolve build path from repo root (two levels up from this file: backend/ -> reactfast/)
    build_path = pathlib.Path(__file__).resolve().parent.parent / build_dir

    if not build_path.is_dir() or not (build_path / "index.html").is_file():
        print(
            f"WARN: Frontend build directory not found or incomplete at {build_path}. Serving frontend will likely fail."
        )
        # Return a dummy router if build isn't ready
        from starlette.routing import Route

        async def dummy_frontend(request):
            return Response(
                "Frontend not built. Run 'npm run build' in the frontend directory.",
                media_type="text/plain",
                status_code=503,
            )

        return Route("/{path:path}", endpoint=dummy_frontend)

    return StaticFiles(directory=build_path, html=True)


# Mount the frontend under /app to avoid conflicts and align with Vite base
app.mount(
    "/",
    create_frontend_router(),
    name="frontend",
)


