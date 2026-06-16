package platformlib

import (
	"time"

	"github.com/nats-io/nats.go"
)

// Bus is a thin NATS wrapper — the analogue of NatsListenerFactory /
// PlmMessageBus. Subscribe runs handler per message; the returned
// *nats.Subscription is drained with Unsubscribe.
type Bus struct {
	conn *nats.Conn
}

// ConnectNats dials NATS with sensible reconnect defaults.
func ConnectNats(url, name string) (*Bus, error) {
	conn, err := nats.Connect(url,
		nats.Name(name),
		nats.MaxReconnects(-1),
		nats.ReconnectWait(2*time.Second),
	)
	if err != nil {
		return nil, err
	}
	return &Bus{conn: conn}, nil
}

func (b *Bus) Subscribe(subject string, handler nats.MsgHandler) (*nats.Subscription, error) {
	return b.conn.Subscribe(subject, handler)
}

func (b *Bus) Publish(subject string, data []byte) error {
	return b.conn.Publish(subject, data)
}

func (b *Bus) Close() {
	if b.conn != nil {
		b.conn.Close()
	}
}
