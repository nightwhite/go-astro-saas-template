package admin

import (
	"github.com/gin-gonic/gin"
	apperrors "github.com/night/go-astro-template/apps/api/internal/pkg/errors"
	"github.com/night/go-astro-template/apps/api/internal/pkg/httpx"
	"github.com/night/go-astro-template/apps/api/internal/pkg/pagination"
)

func (h *Handler) ListUsers(c *gin.Context) {
	query := pagination.FromRequest(c)
	users, total, err := h.userService.List(c.Request.Context(), query)
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	httpx.Paginated(c, gin.H{
		"users":   users,
		"filters": query.Filters,
		"explain": h.userService.Explain(query),
	}, pagination.NewMeta(query.Page, query.PageSize, total))
}

func (h *Handler) GetUser(c *gin.Context) {
	userID := c.Param("userID")
	detail, err := h.userService.Detail(c.Request.Context(), userID)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, gin.H{"detail": detail})
}

func (h *Handler) CreateUser(c *gin.Context) {
	var payload struct {
		Email       string `json:"email"`
		DisplayName string `json:"display_name"`
		Password    string `json:"password"`
		Role        string `json:"role"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}

	user, err := h.userService.Create(c.Request.Context(), payload.Email, payload.DisplayName, payload.Password, payload.Role)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	_ = h.auditService.Record(c.Request.Context(), "users.create", "users", "创建后台用户")
	httpx.Created(c, gin.H{"user": user})
}

func (h *Handler) UpdateUser(c *gin.Context) {
	var payload struct {
		UserID      string `json:"user_id"`
		DisplayName string `json:"display_name"`
		Role        string `json:"role"`
		Status      string `json:"status"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}

	user, err := h.userService.Update(c.Request.Context(), payload.UserID, payload.DisplayName, payload.Role, payload.Status)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	_ = h.auditService.Record(c.Request.Context(), "users.update", "users", "更新后台用户")
	httpx.OK(c, gin.H{"user": user})
}

func (h *Handler) DeleteUser(c *gin.Context) {
	var payload struct {
		UserID string `json:"user_id"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}

	if err := h.userService.Delete(c.Request.Context(), payload.UserID); err != nil {
		httpx.Fail(c, err)
		return
	}
	_ = h.auditService.Record(c.Request.Context(), "users.delete", "users", "删除后台用户")
	httpx.OK(c, gin.H{"deleted": true})
}

func (h *Handler) ResetUserPassword(c *gin.Context) {
	var payload struct {
		UserID      string `json:"user_id"`
		NewPassword string `json:"new_password"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}

	if err := h.userService.ResetPassword(c.Request.Context(), payload.UserID, payload.NewPassword); err != nil {
		httpx.Fail(c, err)
		return
	}
	_ = h.auditService.Record(c.Request.Context(), "users.password.reset", "users", "重置用户密码")
	httpx.OK(c, gin.H{"reset": true})
}
