package admin

import (
	"github.com/gin-gonic/gin"
	apperrors "github.com/night/go-astro-template/apps/api/internal/pkg/errors"
	"github.com/night/go-astro-template/apps/api/internal/pkg/httpx"
	"github.com/night/go-astro-template/apps/api/internal/pkg/pagination"
)

func (h *Handler) ListRoles(c *gin.Context) {
	query := pagination.FromRequest(c)
	h.roleService.AuditPermissionSync(c.Request.Context())
	_ = h.auditService.Record(c.Request.Context(), "roles.permissions.sync", "role_permissions", "读取角色与权限列表")
	roles, total, err := h.roleService.List(c.Request.Context(), query)
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	httpx.Paginated(c, gin.H{"roles": roles}, pagination.NewMeta(query.Page, query.PageSize, total))
}

func (h *Handler) UpdateRolePermissions(c *gin.Context) {
	var payload struct {
		RoleID         string   `json:"role_id"`
		PermissionKeys []string `json:"permission_keys"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	if payload.RoleID == "" {
		httpx.Fail(c, apperrors.BadRequest("role_id is required"))
		return
	}

	if err := h.roleService.UpdateRolePermissions(c.Request.Context(), payload.RoleID, payload.PermissionKeys); err != nil {
		httpx.Fail(c, err)
		return
	}
	_ = h.auditService.Record(c.Request.Context(), "roles.permissions.update", "role_permissions", "更新角色权限映射")
	httpx.OK(c, gin.H{"updated": true})
}

func (h *Handler) BindUserRole(c *gin.Context) {
	var payload struct {
		Email  string `json:"email"`
		RoleID string `json:"role_id"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	if payload.Email == "" || payload.RoleID == "" {
		httpx.Fail(c, apperrors.BadRequest("email and role_id are required"))
		return
	}

	if err := h.roleService.BindUserRole(c.Request.Context(), payload.Email, payload.RoleID); err != nil {
		httpx.Fail(c, err)
		return
	}
	_ = h.auditService.Record(c.Request.Context(), "roles.user.bind", "user_role_bindings", "绑定用户角色")
	httpx.OK(c, gin.H{"bound": true})
}

func (h *Handler) CurrentUserRoles(c *gin.Context) {
	roles, err := h.roleService.ListCurrentUserRoles(c.Request.Context())
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, gin.H{"roles": roles})
}
