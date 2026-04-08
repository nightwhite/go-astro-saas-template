package config

import "time"

type JobsConfig struct {
	QueuePrefix      string
	DefaultQueue     string
	CriticalQueue    string
	PollInterval     time.Duration
	ScheduleInterval time.Duration
	MaxRetries       int
	BackoffBase      time.Duration
	Retention        time.Duration
}
