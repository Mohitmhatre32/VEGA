from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.features.classification.router import router as classification_router
from app.features.training.router import router as training_router
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

# Include Routers
app.include_router(classification_router)
app.include_router(training_router)

# Mount Static Folder for the Demo
app.mount("/", StaticFiles(directory="app/static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)