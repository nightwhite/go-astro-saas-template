import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";

export interface TeamRecord {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  owner_user_id: string;
}

export interface TeamMemberRecord {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  display_name: string;
  email: string;
  created_at: string;
}

export interface TeamInviteRecord {
  id: string;
  team_id: string;
  email: string;
  token: string;
  status: string;
  invited_by: string;
  expires_at: string;
}

export interface TeamDetailRecord {
  team: TeamRecord;
  members: TeamMemberRecord[];
}

export interface TeamRoleRecord {
  id: string;
  team_id?: string;
  name: string;
  description: string;
  permissions: string[];
  is_editable: boolean;
}

export async function fetchTeams() {
  const response = await apiGet<{ teams: TeamRecord[] }>("/api/v1/teams");
  return response.data.teams;
}

export async function fetchTeamDetail(teamID: string) {
  const normalized = teamID.trim();
  const allTeams = await fetchTeams();
  const matched = allTeams.find((item) => item.id === normalized || item.slug === normalized);
  const resolvedID = matched?.id || normalized;
  const response = await apiGet<{ team: TeamRecord; members: TeamMemberRecord[] }>(`/api/v1/teams/${encodeURIComponent(resolvedID)}`);
  return response.data;
}

export async function createTeam(name: string) {
  return apiPost<{ team: TeamRecord }>("/api/v1/teams", { name });
}

export async function inviteTeamMember(teamID: string, email: string) {
  return apiPost<{ invite: TeamInviteRecord }>(`/api/v1/teams/${encodeURIComponent(teamID)}/invitations`, { email });
}

export async function acceptTeamInvite(token: string) {
  return apiPost<{ accepted: boolean; team_id?: string }>("/api/v1/teams/invitations/accept", { token });
}

export async function fetchPendingInvites() {
  const response = await apiGet<{ invites: TeamInviteRecord[] }>("/api/v1/teams/invites/pending");
  return response.data.invites;
}

export async function updateTeam(teamID: string, name: string) {
  return apiPatch<{ team: TeamRecord }>(`/api/v1/teams/${encodeURIComponent(teamID)}`, { name });
}

export async function deleteTeam(teamID: string) {
  return apiDelete<{ ok: boolean }>(`/api/v1/teams/${encodeURIComponent(teamID)}`, {});
}

export async function selectTeam(teamID: string) {
  return apiPost<{ ok: boolean }>(`/api/v1/teams/${encodeURIComponent(teamID)}/select`, {});
}

export async function fetchTeamInvites(teamID: string) {
  const response = await apiGet<{ invites: TeamInviteRecord[] }>(`/api/v1/teams/${encodeURIComponent(teamID)}/invitations`);
  return response.data.invites;
}

export async function cancelTeamInvite(invitationID: string) {
  return apiDelete<{ ok: boolean }>(`/api/v1/teams/invitations/${encodeURIComponent(invitationID)}`, {});
}

export async function fetchTeamMembers(teamID: string) {
  const response = await apiGet<{ team: TeamRecord; members: TeamMemberRecord[] }>(`/api/v1/teams/${encodeURIComponent(teamID)}/members`);
  return response.data.members;
}

export async function updateTeamMemberRole(teamID: string, userID: string, role: string) {
  return apiPatch<{ ok: boolean }>(
    `/api/v1/teams/${encodeURIComponent(teamID)}/members/${encodeURIComponent(userID)}/role`,
    { role },
  );
}

export async function removeTeamMember(teamID: string, userID: string) {
  return apiDelete<{ ok: boolean }>(`/api/v1/teams/${encodeURIComponent(teamID)}/members/${encodeURIComponent(userID)}`, {});
}

export async function fetchTeamRoles(teamID: string) {
  const response = await apiGet<{ roles: TeamRoleRecord[] }>(`/api/v1/teams/${encodeURIComponent(teamID)}/roles`);
  return response.data.roles;
}

export async function createTeamRole(
  teamID: string,
  payload: { role_id: string; name: string; description?: string; permissions?: string[] },
) {
  return apiPost<{ role: TeamRoleRecord }>(`/api/v1/teams/${encodeURIComponent(teamID)}/roles`, payload);
}

export async function updateTeamRole(
  teamID: string,
  roleID: string,
  payload: { name: string; description?: string; permissions?: string[] },
) {
  return apiPatch<{ role: TeamRoleRecord }>(`/api/v1/teams/${encodeURIComponent(teamID)}/roles/${encodeURIComponent(roleID)}`, payload);
}

export async function deleteTeamRole(teamID: string, roleID: string) {
  return apiDelete<{ ok: boolean }>(`/api/v1/teams/${encodeURIComponent(teamID)}/roles/${encodeURIComponent(roleID)}`, {});
}
