from fastapi import FastAPI
from app import auth
from app.otel_setup import setup_tracing, setup_metrics

app = FastAPI()

setup_tracing(app)
setup_metrics()

app.include_router(auth.router)
