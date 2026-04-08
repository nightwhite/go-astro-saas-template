package cache

import "fmt"

func Key(parts ...string) string {
	if len(parts) == 0 {
		return ""
	}

	key := parts[0]
	for _, part := range parts[1:] {
		key = fmt.Sprintf("%s:%s", key, part)
	}
	return key
}
