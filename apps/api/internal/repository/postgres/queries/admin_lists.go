package queries

const (
	UserListExplain    = "users: tenant_id + created_at/email/role/status 白名单排序，tenant_id + role/status 辅助索引配合分页。"
	FileListExplain    = "files: tenant_id + created_at/object_key 复合索引支持列表与对象精确定位，content_type/file_name 走白名单筛选。"
	JobListExplain     = "job_records: tenant_id + executed_at / job_type + status 支撑队列看板、重试和死信查询。"
	AuditListExplain   = "audit_logs: tenant_id + created_at / action + created_at 支撑后台审计与安全事件追踪。"
	UserListSQL        = "SELECT id,email,display_name,role,status,created_at FROM users WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3"
	UserListKeysetSQL  = "SELECT id,email,display_name,role,status,created_at FROM users WHERE tenant_id=$1 AND created_at < $2 ORDER BY created_at DESC LIMIT $3"
	FileListSQL        = "SELECT id,object_key,file_name,content_type,size_bytes,created_at FROM files WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3"
	FileListKeysetSQL  = "SELECT id,object_key,file_name,content_type,size_bytes,created_at FROM files WHERE tenant_id=$1 AND created_at < $2 ORDER BY created_at DESC LIMIT $3"
	JobListSQL         = "SELECT id,job_type,status,queue,attempts,last_error,executed_at FROM job_records WHERE tenant_id=$1 ORDER BY executed_at DESC LIMIT $2 OFFSET $3"
	JobListKeysetSQL   = "SELECT id,job_type,status,queue,attempts,last_error,executed_at FROM job_records WHERE tenant_id=$1 AND executed_at < $2 ORDER BY executed_at DESC LIMIT $3"
	AuditListSQL       = "SELECT id,actor_email,action,resource,detail,created_at FROM audit_logs WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3"
	AuditListKeysetSQL = "SELECT id,actor_email,action,resource,detail,created_at FROM audit_logs WHERE tenant_id=$1 AND created_at < $2 ORDER BY created_at DESC LIMIT $3"
)
