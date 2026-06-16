package platformlib

import (
	"crypto/sha1"
	"encoding/hex"
)

// InstanceID is the deterministic id = first 10 hex chars of SHA-1(baseURL),
// matching spe-api so a re-registering instance replaces its own entry.
func InstanceID(baseURL string) string {
	sum := sha1.Sum([]byte(baseURL))
	return hex.EncodeToString(sum[:])[:10]
}
