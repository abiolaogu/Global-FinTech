from fastapi import FastAPI

app = FastAPI(
    title="Risk Engine Service",
    description="Provides real-time risk scoring and analysis.",
    version="0.1.0",
)

@app.get("/health")
def health_check():
    return {"status": "UP"}
