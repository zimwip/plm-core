package platformlib

import (
	"errors"
	"fmt"
	"time"

	jwt "github.com/golang-jwt/jwt/v5"
)

const (
	TypForward = "fwd"
	TypSession = "session"
	TypOp      = "op"
)

// ErrWrongTokenType is returned when a token's typ claim does not match the
// verifier's expectation (a session token must never pass as forward, etc).
var ErrWrongTokenType = errors.New("wrong token type")

// ForwardUser is the identity carried by a forward JWT (typ=fwd), the token
// spe-api injects on the Authorization header before proxying. Mirrors
// ws-gateway's JwtVerifier.UserInfo plus isAdmin.
type ForwardUser struct {
	UserID         string
	ProjectSpaceID string
	Username       string
	IsAdmin        bool
}

// Codec verifies HS256 JWTs minted by spe-api. Key = plm.service.secret
// (>=32 bytes). Mirrors the relevant half of JwtService / JwtVerifier.
type Codec struct {
	secret    []byte
	clockSkew time.Duration
}

// NewCodec builds a codec, rejecting secrets shorter than 32 bytes (the HS256
// minimum enforced by the Java side).
func NewCodec(secret string, clockSkewSeconds int) (*Codec, error) {
	if len(secret) < 32 {
		return nil, fmt.Errorf("plm.service.secret must be at least 32 bytes for HS256 (got %d)", len(secret))
	}
	return &Codec{secret: []byte(secret), clockSkew: time.Duration(clockSkewSeconds) * time.Second}, nil
}

func (c *Codec) parse(token string) (jwt.MapClaims, error) {
	claims := jwt.MapClaims{}
	_, err := jwt.ParseWithClaims(token, claims, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return c.secret, nil
	}, jwt.WithValidMethods([]string{"HS256"}), jwt.WithLeeway(c.clockSkew))
	if err != nil {
		return nil, err
	}
	return claims, nil
}

func (c *Codec) parseTyped(token, expected string) (jwt.MapClaims, error) {
	claims, err := c.parse(token)
	if err != nil {
		return nil, err
	}
	typ, _ := claims["typ"].(string)
	if typ != expected {
		return nil, fmt.Errorf("%w: expected %s, got %s", ErrWrongTokenType, expected, typ)
	}
	return claims, nil
}

// VerifyForward verifies a forward JWT (typ=fwd) and extracts the identity.
// This is what ws-gateway needs on the WebSocket handshake.
func (c *Codec) VerifyForward(token string) (*ForwardUser, error) {
	claims, err := c.parseTyped(token, TypForward)
	if err != nil {
		return nil, err
	}
	sub, _ := claims["sub"].(string)
	ps, _ := claims["ps"].(string)
	username, _ := claims["username"].(string)
	isAdmin, _ := claims["isAdmin"].(bool)
	return &ForwardUser{UserID: sub, ProjectSpaceID: ps, Username: username, IsAdmin: isAdmin}, nil
}

// VerifySession verifies a session JWT (typ=session), returning (userId, ps).
func (c *Codec) VerifySession(token string) (userID, projectSpaceID string, err error) {
	claims, err := c.parseTyped(token, TypSession)
	if err != nil {
		return "", "", err
	}
	sub, _ := claims["sub"].(string)
	ps, _ := claims["ps"].(string)
	return sub, ps, nil
}
