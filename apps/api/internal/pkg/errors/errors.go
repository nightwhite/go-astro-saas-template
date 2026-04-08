package errors

import "net/http"

type AppError struct {
	Code       string
	Message    string
	StatusCode int
}

func (e *AppError) Error() string {
	return e.Message
}

func New(code, message string, statusCode int) *AppError {
	return &AppError{
		Code:       code,
		Message:    message,
		StatusCode: statusCode,
	}
}

func BadRequest(message string) *AppError {
	return New("bad_request", message, http.StatusBadRequest)
}

func Unauthorized(message string) *AppError {
	return New("unauthorized", message, http.StatusUnauthorized)
}

func Forbidden(message string) *AppError {
	return New("forbidden", message, http.StatusForbidden)
}

func NotFound(message string) *AppError {
	return New("not_found", message, http.StatusNotFound)
}

func Conflict(message string) *AppError {
	return New("conflict", message, http.StatusConflict)
}

func TooManyRequests(message string) *AppError {
	return New("too_many_requests", message, http.StatusTooManyRequests)
}

func UnprocessableEntity(message string) *AppError {
	return New("unprocessable_entity", message, http.StatusUnprocessableEntity)
}

func Internal(message string) *AppError {
	return New("internal_error", message, http.StatusInternalServerError)
}
