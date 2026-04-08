package auth

import "context"

type MailVerifier interface {
	SendVerificationCode(ctx context.Context, to, code string) (string, error)
	SendPasswordReset(ctx context.Context, to, token string) (string, error)
}

type AuditRecorder interface {
	Record(ctx context.Context, action, resource, detail string) error
}

type CaptchaVerifier interface {
	Verify(ctx context.Context, token string) (bool, error)
}
