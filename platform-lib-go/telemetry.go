package platformlib

import (
	"context"
	"strings"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

// InitTracer wires an OTLP/HTTP exporter to the collector, installs the global
// tracer provider and the W3C TraceContext propagator, and returns a shutdown
// func to flush spans. `endpoint` is the collector base (e.g.
// http://jaeger:4318); `/v1/traces` is appended. Mirrors the Rust
// telemetry::init_tracer so Go and Rust services trace into the same Jaeger.
func InitTracer(ctx context.Context, serviceName, endpoint string) (func(context.Context) error, error) {
	exp, err := otlptracehttp.New(ctx,
		otlptracehttp.WithEndpointURL(strings.TrimRight(endpoint, "/")+"/v1/traces"),
	)
	if err != nil {
		return nil, err
	}
	res, err := resource.New(ctx,
		resource.WithAttributes(attribute.String("service.name", serviceName)),
	)
	if err != nil {
		return nil, err
	}
	tp := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exp),
		sdktrace.WithResource(res),
	)
	otel.SetTracerProvider(tp)
	otel.SetTextMapPropagator(propagation.TraceContext{})
	return tp.Shutdown, nil
}
