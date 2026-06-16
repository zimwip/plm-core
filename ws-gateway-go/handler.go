package main

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/nats-io/nats.go"
	platformlib "github.com/plm/platform-lib-go"
	"go.opentelemetry.io/otel/trace"
)

const (
	heartbeatInterval = 25 * time.Second
	heartbeatFrame    = `{"type":"heartbeat"}`
	writeWait         = 5 * time.Second
)

// wsSession is one browser connection. Port of the per-session state in
// PlmWebSocketHandler + SessionRegistry. gorilla's Conn is not safe for
// concurrent writes, so every write goes through writeMu.
type wsSession struct {
	conn    *websocket.Conn
	bus     *platformlib.Bus
	userID  string
	span    trace.Span
	writeMu sync.Mutex

	subMu      sync.Mutex
	globalSub  *nats.Subscription
	projectSub *nats.Subscription
}

func (s *wsSession) writeText(payload []byte) {
	s.writeMu.Lock()
	defer s.writeMu.Unlock()
	_ = s.conn.SetWriteDeadline(time.Now().Add(writeWait))
	if err := s.conn.WriteMessage(websocket.TextMessage, payload); err != nil {
		log.Printf("ws write failed (user=%s): %v", s.userID, err)
	}
}

// run drives the session: subscribe to global.>, start the heartbeat, then
// read client messages until the socket closes.
func (s *wsSession) run() {
	defer s.close()

	// On connect: subscribe to global broadcast events.
	sub, err := s.bus.Subscribe("global.>", func(m *nats.Msg) {
		s.writeText(m.Data)
	})
	if err != nil {
		log.Printf("ws global subscribe failed (user=%s): %v", s.userID, err)
		return
	}
	s.subMu.Lock()
	s.globalSub = sub
	s.subMu.Unlock()

	stopHeartbeat := make(chan struct{})
	go s.heartbeatLoop(stopHeartbeat)
	defer close(stopHeartbeat)

	for {
		mt, data, err := s.conn.ReadMessage()
		if err != nil {
			return // client closed or transport error
		}
		if mt != websocket.TextMessage {
			continue
		}
		s.handleClientMessage(data)
	}
}

// handleClientMessage processes {"type":"subscribe","projectSpaceId":"ps"} by
// swapping the per-project NATS subscription. Other types are ignored.
func (s *wsSession) handleClientMessage(data []byte) {
	var msg struct {
		Type           string `json:"type"`
		ProjectSpaceID string `json:"projectSpaceId"`
	}
	if err := json.Unmarshal(data, &msg); err != nil {
		log.Printf("ws subscribe parse error (user=%s): %v", s.userID, err)
		return
	}
	if msg.Type != "subscribe" || msg.ProjectSpaceID == "" {
		return
	}

	subject := "project." + msg.ProjectSpaceID + ".users." + s.userID + ".>"
	newSub, err := s.bus.Subscribe(subject, func(m *nats.Msg) {
		s.writeText(m.Data)
	})
	if err != nil {
		log.Printf("ws project subscribe failed (user=%s): %v", s.userID, err)
		return
	}

	s.subMu.Lock()
	old := s.projectSub
	s.projectSub = newSub
	s.subMu.Unlock()
	if old != nil {
		_ = old.Unsubscribe()
	}
	log.Printf("ws project subscription updated: user=%s ps=%s", s.userID, msg.ProjectSpaceID)
}

func (s *wsSession) heartbeatLoop(stop <-chan struct{}) {
	ticker := time.NewTicker(heartbeatInterval)
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C:
			s.writeText([]byte(heartbeatFrame))
		case <-stop:
			return
		}
	}
}

func (s *wsSession) close() {
	s.subMu.Lock()
	if s.globalSub != nil {
		_ = s.globalSub.Unsubscribe()
	}
	if s.projectSub != nil {
		_ = s.projectSub.Unsubscribe()
	}
	s.subMu.Unlock()
	_ = s.conn.Close()
	if s.span != nil {
		s.span.End()
	}
}
