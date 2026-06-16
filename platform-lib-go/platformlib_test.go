package platformlib

import (
	"context"
	"testing"
	"time"

	jwt "github.com/golang-jwt/jwt/v5"
)

const testSecret = "test-secret-at-least-32-bytes-long!!"

// mintForward builds a forward token the way spe-api would, so we can verify
// the Go codec accepts genuine spe-shaped tokens.
func mintForward(t *testing.T, typ, sub, ps, username string, admin bool, ttl time.Duration) string {
	t.Helper()
	now := time.Now()
	claims := jwt.MapClaims{
		"iss": "spe-api", "sub": sub, "typ": typ,
		"username": username, "isAdmin": admin, "ps": ps,
		"jti": "x", "iat": now.Unix(), "exp": now.Add(ttl).Unix(),
	}
	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	s, err := tok.SignedString([]byte(testSecret))
	if err != nil {
		t.Fatal(err)
	}
	return s
}

func TestNewCodecRejectsShortSecret(t *testing.T) {
	if _, err := NewCodec("short", 5); err == nil {
		t.Fatal("expected error for short secret")
	}
}

func TestVerifyForward(t *testing.T) {
	c, _ := NewCodec(testSecret, 5)
	tok := mintForward(t, TypForward, "u1", "ps-1", "alice", true, time.Minute)
	u, err := c.VerifyForward(tok)
	if err != nil {
		t.Fatal(err)
	}
	if u.UserID != "u1" || u.ProjectSpaceID != "ps-1" || u.Username != "alice" || !u.IsAdmin {
		t.Fatalf("unexpected user: %+v", u)
	}
}

func TestTypConfusionRejected(t *testing.T) {
	c, _ := NewCodec(testSecret, 5)
	// a session token must not verify as forward
	tok := mintForward(t, TypSession, "u2", "", "", false, time.Minute)
	if _, err := c.VerifyForward(tok); err == nil {
		t.Fatal("expected wrong-type rejection")
	}
}

func TestExpiredRejected(t *testing.T) {
	c, _ := NewCodec(testSecret, 5)
	tok := mintForward(t, TypForward, "u3", "", "", false, -time.Hour)
	if _, err := c.VerifyForward(tok); err == nil {
		t.Fatal("expected expiry rejection")
	}
}

func TestBadSignatureRejected(t *testing.T) {
	c, _ := NewCodec("another-secret-at-least-32-bytes!!!!", 5)
	tok := mintForward(t, TypForward, "u4", "", "", false, time.Minute)
	if _, err := c.VerifyForward(tok); err == nil {
		t.Fatal("expected signature rejection")
	}
}

func TestInstanceIDDeterministic(t *testing.T) {
	a := InstanceID("http://ws-gateway:8085")
	b := InstanceID("http://ws-gateway:8085")
	if a != b || len(a) != 10 {
		t.Fatalf("bad instance id: %q %q", a, b)
	}
	if a == InstanceID("http://ws-gateway:9999") {
		t.Fatal("expected different ids for different urls")
	}
}

func TestRegistryRoundRobinAndStale(t *testing.T) {
	r := NewLocalServiceRegistry()
	r.UpdateFromSnapshot(RegistrySnapshot{Version: 5, Services: map[string][]ServiceInstanceInfo{
		"psm": {{InstanceID: "a", Healthy: true}, {InstanceID: "b", Healthy: true}},
	}})
	p1, _ := r.PickInstance("psm")
	p2, _ := r.PickInstance("psm")
	if p1.InstanceID == p2.InstanceID {
		t.Fatal("expected round-robin to alternate")
	}
	// stale snapshot ignored
	r.UpdateFromSnapshot(RegistrySnapshot{Version: 3, Services: map[string][]ServiceInstanceInfo{
		"psm": {{InstanceID: "c", Healthy: true}},
	}})
	if r.Version() != 5 {
		t.Fatalf("expected version 5, got %d", r.Version())
	}
}

func TestRegistryPrefersHealthy(t *testing.T) {
	r := NewLocalServiceRegistry()
	r.UpdateFromSnapshot(RegistrySnapshot{Version: 1, Services: map[string][]ServiceInstanceInfo{
		"psm": {{InstanceID: "dead", Healthy: false}, {InstanceID: "live", Healthy: true}},
	}})
	for i := 0; i < 4; i++ {
		p, _ := r.PickInstance("psm")
		if p.InstanceID != "live" {
			t.Fatalf("expected live, got %s", p.InstanceID)
		}
	}
}

func TestAwaitPopulated(t *testing.T) {
	r := NewLocalServiceRegistry()
	ctx, cancel := context.WithTimeout(context.Background(), 50*time.Millisecond)
	defer cancel()
	if r.AwaitPopulated(ctx) {
		t.Fatal("should not be populated yet")
	}
	r.UpdateFromSnapshot(RegistrySnapshot{Version: 1, Services: map[string][]ServiceInstanceInfo{}})
	ctx2, cancel2 := context.WithTimeout(context.Background(), time.Second)
	defer cancel2()
	if !r.AwaitPopulated(ctx2) {
		t.Fatal("should be populated")
	}
}
