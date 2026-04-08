package httpx

import (
	"bytes"
	"encoding/json"
	"io"
	"strings"
)

func RequestBodyBytes(reader io.Reader) []byte {
	if reader == nil {
		return nil
	}

	payload, err := io.ReadAll(reader)
	if err != nil {
		return nil
	}
	return payload
}

func RestoreBody(payload []byte) io.ReadCloser {
	return io.NopCloser(bytes.NewBuffer(payload))
}

func ContainsSensitiveField(payload []byte, fields []string) bool {
	if len(payload) == 0 || len(fields) == 0 {
		return false
	}

	var body map[string]any
	if err := json.Unmarshal(payload, &body); err != nil {
		return false
	}

	for key := range body {
		lowerKey := strings.ToLower(key)
		for _, field := range fields {
			if lowerKey == strings.ToLower(field) {
				return true
			}
		}
	}

	return false
}
