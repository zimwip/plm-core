package main

import (
	"fmt"
	"net/url"
)

// qesc query-escapes a value for use in a URL query string.
func qesc(s string) string { return url.QueryEscape(s) }

// mstr reads a string field from a decoded JSON map, coercing non-string scalars
// via fmt. Missing or nil → "".
func mstr(m map[string]any, key string) string {
	v, ok := m[key]
	if !ok || v == nil {
		return ""
	}
	if s, ok := v.(string); ok {
		return s
	}
	return fmt.Sprint(v)
}

// asMaps coerces a decoded JSON value into a slice of object maps, skipping
// anything that is not an object.
func asMaps(v any) []map[string]any {
	list, ok := v.([]any)
	if !ok {
		return nil
	}
	out := make([]map[string]any, 0, len(list))
	for _, item := range list {
		if m, ok := item.(map[string]any); ok {
			out = append(out, m)
		}
	}
	return out
}
