// Package platformlib is a minimal Go port of the PLM Core platform-lib.
// It reproduces the wire contracts (JWT claims, registration DTOs, instance-id
// derivation, NATS subjects, S2S headers) so Go services interoperate with the
// Java stack. Only the subset needed by thin services (ws-gateway) is covered:
// JWT verification, the local registry, self-registration and a NATS wrapper.
package platformlib

// RegisterRequest is POSTed to platform-api
// /api/platform/internal/environment/register. Mirrors the Java record;
// JSON field names match Jackson's camelCase output.
type RegisterRequest struct {
	ServiceCode string   `json:"serviceCode"`
	BaseURL     string   `json:"baseUrl"`
	HealthURL   string   `json:"healthUrl"`
	RoutePrefix string   `json:"routePrefix"`
	ExtraPaths  []string `json:"extraPaths"`
	Version     string   `json:"version"`
	SpaceTag    string   `json:"spaceTag"`
	Features    []string `json:"features"`
}

// ServiceInstanceInfo is the lightweight per-instance view in a snapshot.
type ServiceInstanceInfo struct {
	InstanceID  string `json:"instanceId"`
	ServiceCode string `json:"serviceCode"`
	BaseURL     string `json:"baseUrl"`
	Version     string `json:"version,omitempty"`
	SpaceTag    string `json:"spaceTag,omitempty"`
	Healthy     bool   `json:"healthy"`
}

// RegistrySnapshot is pulled from platform-api. Version is monotonic.
type RegistrySnapshot struct {
	Version  int64                            `json:"version"`
	Services map[string][]ServiceInstanceInfo `json:"services"`
}

// RegisterResponse is the body returned by a successful registration.
type RegisterResponse struct {
	InstanceID string `json:"instanceId"`
}
