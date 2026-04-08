package httpx

import (
	"net/http"

	"github.com/gin-gonic/gin"
	apperrors "github.com/night/go-astro-template/apps/api/internal/pkg/errors"
	"github.com/night/go-astro-template/apps/api/internal/pkg/pagination"
)

type Envelope struct {
	Data       any              `json:"data,omitempty"`
	Error      *ErrorResponse   `json:"error,omitempty"`
	Pagination *pagination.Meta `json:"pagination,omitempty"`
	RequestID  string           `json:"request_id,omitempty"`
}

type ErrorResponse struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

const requestIDKey = "request_id"

func OK(c *gin.Context, data any) {
	c.JSON(http.StatusOK, Envelope{
		Data:      data,
		RequestID: requestIDFromContext(c),
	})
}

func Created(c *gin.Context, data any) {
	c.JSON(http.StatusCreated, Envelope{
		Data:      data,
		RequestID: requestIDFromContext(c),
	})
}

func Paginated(c *gin.Context, data any, meta pagination.Meta) {
	c.JSON(http.StatusOK, Envelope{
		Data:       data,
		Pagination: &meta,
		RequestID:  requestIDFromContext(c),
	})
}

func Fail(c *gin.Context, err error) {
	if appErr, ok := err.(*apperrors.AppError); ok {
		c.JSON(appErr.StatusCode, Envelope{
			Error: &ErrorResponse{
				Code:    appErr.Code,
				Message: appErr.Message,
			},
			RequestID: requestIDFromContext(c),
		})
		return
	}

	c.JSON(http.StatusInternalServerError, Envelope{
		Error: &ErrorResponse{
			Code:    "internal_error",
			Message: err.Error(),
		},
		RequestID: requestIDFromContext(c),
	})
}

func requestIDFromContext(c *gin.Context) string {
	if value, exists := c.Get(requestIDKey); exists {
		if requestID, ok := value.(string); ok {
			return requestID
		}
	}
	return ""
}
