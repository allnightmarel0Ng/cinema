from opentelemetry import trace
from app.database import engine
from opentelemetry.metrics import set_meter_provider
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.redis import RedisInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

from app.database import SessionLocal

from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk.resources import Resource

def setup_tracing(app):
    resource = Resource(attributes={"service.name": "auth_service"})
    tracer_provider = TracerProvider(resource=resource)
    trace.set_tracer_provider(tracer_provider)

    otlp_exporter = OTLPSpanExporter(endpoint="http://otel-collector:4318", insecure=True)
    span_processor = BatchSpanProcessor(otlp_exporter) 
    tracer_provider.add_span_processor(span_processor)

    FastAPIInstrumentor.instrument_app(app)
    RedisInstrumentor().instrument()
    SQLAlchemyInstrumentor().instrument(engine=engine.sync_engine)

def setup_metrics():
    resource = Resource(attributes={"service.name": "auth_service"})
    metric_reader = PeriodicExportingMetricReader(
        OTLPMetricExporter(endpoint="otel-collector:4317", insecure=True)
    )
    meter_provider = MeterProvider(resource=resource, metric_readers=[metric_reader])
    set_meter_provider(meter_provider)