#!/usr/bin/env sh
set -eu

cat <<'EOF'
Demo seed strategy:
- API bootstrap seeds default admin, roles, permissions, jobs, audit logs
- Access /api/v1/admin/files/demo to create demo file records
- Access /api/v1/auth/verification-code to test verification flow
EOF
