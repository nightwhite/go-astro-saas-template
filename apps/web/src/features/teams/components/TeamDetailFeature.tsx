import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminPageLayout, EmptyState } from "@repo/ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  cancelTeamInvite,
  createTeamRole,
  deleteTeamRole,
  deleteTeam,
  fetchTeamDetail,
  fetchTeamInvites,
  fetchTeamMembers,
  fetchTeamRoles,
  inviteTeamMember,
  removeTeamMember,
  selectTeam,
  type TeamDetailRecord,
  type TeamInviteRecord,
  type TeamMemberRecord,
  type TeamRoleRecord,
  updateTeam,
  updateTeamRole,
  updateTeamMemberRole,
} from "@/features/teams/api/teams";
import { t, type Locale } from "@/lib/i18n";

interface TeamDetailFeatureProps {
  detail: TeamDetailRecord | null;
  teamID?: string;
  locale: Locale;
}

export function TeamDetailFeature({ detail, teamID: inputTeamID = "", locale }: TeamDetailFeatureProps) {
  const m = t(locale).dashboard;
  const [teamDetail, setTeamDetail] = useState<TeamDetailRecord | null>(detail);
  const [name, setName] = useState(detail?.team.name || "");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invites, setInvites] = useState<TeamInviteRecord[]>([]);
  const [members, setMembers] = useState<TeamMemberRecord[]>(detail?.members || []);
  const [roles, setRoles] = useState<TeamRoleRecord[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoadingInvites, setIsLoadingInvites] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingInvite, setIsSavingInvite] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [roleID, setRoleID] = useState("");
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [rolePermissions, setRolePermissions] = useState("");
  const [editingRoleID, setEditingRoleID] = useState("");
  const [isSavingRole, setIsSavingRole] = useState(false);

  const resolvedTeamID = useMemo(() => {
    return teamDetail?.team.id || inputTeamID.trim();
  }, [inputTeamID, teamDetail?.team.id]);

  const ownerUserID = teamDetail?.team.owner_user_id || "";

  function formatDateTime(value: string): string {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString();
  }

  useEffect(() => {
    setTeamDetail(detail);
  }, [detail]);

  useEffect(() => {
    setName(teamDetail?.team.name || "");
    setMembers(teamDetail?.members || []);
  }, [teamDetail?.team.name, teamDetail?.members]);

  useEffect(() => {
    if (teamDetail || !inputTeamID.trim()) return;
    setIsLoadingDetail(true);
    void fetchTeamDetail(inputTeamID.trim())
      .then((result) => {
        setTeamDetail(result);
      })
      .catch(() => {
        setTeamDetail(null);
      })
      .finally(() => {
        setIsLoadingDetail(false);
      });
  }, [teamDetail, inputTeamID]);

  async function refreshInvites() {
    if (!resolvedTeamID) return;
    setIsLoadingInvites(true);
    try {
      const result = await fetchTeamInvites(resolvedTeamID);
      setInvites(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : m.teamDetail.failedLoadInvites;
      toast.error(message);
    } finally {
      setIsLoadingInvites(false);
    }
  }

  async function refreshMembersAndRoles() {
    if (!resolvedTeamID) return;
    setIsLoadingMembers(true);
    try {
      const [memberResult, roleResult] = await Promise.all([fetchTeamMembers(resolvedTeamID), fetchTeamRoles(resolvedTeamID)]);
      setMembers(memberResult);
      setRoles(roleResult);
    } catch (error) {
      const message = error instanceof Error ? error.message : m.teamDetail.failedLoadMembers;
      toast.error(message);
    } finally {
      setIsLoadingMembers(false);
    }
  }

  useEffect(() => {
    if (!resolvedTeamID) return;
    void refreshInvites();
    void refreshMembersAndRoles();
  }, [resolvedTeamID]);

  const roleOptions = useMemo(() => {
    if (!roles.length) return ["owner", "member"];
    return roles.map((item) => item.id);
  }, [roles]);

  async function onSaveTeamProfile(event: any) {
    event.preventDefault();
    if (!resolvedTeamID) return;
    const nextName = name.trim();
    if (!nextName) {
      toast.error(m.teamDetail.validationTeamNameRequired);
      return;
    }
    setIsSavingProfile(true);
    const loadingID = toast.loading(m.teamDetail.savingProfile);
    try {
      const response = await updateTeam(resolvedTeamID, nextName);
      setTeamDetail((current) => (current ? { ...current, team: response.data.team } : current));
      toast.success(m.teamDetail.profileSaved, { id: loadingID });
    } catch (error) {
      const message = error instanceof Error ? error.message : m.teamDetail.profileSaveFailed;
      toast.error(message, { id: loadingID });
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function onInviteMember(event: any) {
    event.preventDefault();
    if (!resolvedTeamID) return;
    const email = inviteEmail.trim();
    if (!email) {
      toast.error(m.teamDetail.validationInviteEmailRequired);
      return;
    }
    setIsSavingInvite(true);
    const loadingID = toast.loading(m.teamDetail.invitingMember);
    try {
      await inviteTeamMember(resolvedTeamID, email);
      setInviteEmail("");
      await refreshInvites();
      toast.success(m.teamDetail.inviteCreated, { id: loadingID });
    } catch (error) {
      const message = error instanceof Error ? error.message : m.teamDetail.inviteCreateFailed;
      toast.error(message, { id: loadingID });
    } finally {
      setIsSavingInvite(false);
    }
  }

  async function onCancelInvite(invitationID: string) {
    const loadingID = toast.loading(m.teamDetail.cancelingInvite);
    try {
      await cancelTeamInvite(invitationID);
      setInvites((current) => current.filter((item) => item.id !== invitationID));
      toast.success(m.teamDetail.inviteCanceled, { id: loadingID });
    } catch (error) {
      const message = error instanceof Error ? error.message : m.teamDetail.inviteCancelFailed;
      toast.error(message, { id: loadingID });
    }
  }

  async function onUpdateMemberRole(userID: string, role: string) {
    if (!resolvedTeamID) return;
    const loadingID = toast.loading(m.teamDetail.updatingRole);
    try {
      await updateTeamMemberRole(resolvedTeamID, userID, role);
      setMembers((current) => current.map((item) => (item.user_id === userID ? { ...item, role } : item)));
      toast.success(m.teamDetail.roleUpdated, { id: loadingID });
    } catch (error) {
      const message = error instanceof Error ? error.message : m.teamDetail.roleUpdateFailed;
      toast.error(message, { id: loadingID });
    }
  }

  async function onRemoveMember(userID: string) {
    if (!resolvedTeamID) return;
    const loadingID = toast.loading(m.teamDetail.removingMember);
    try {
      await removeTeamMember(resolvedTeamID, userID);
      setMembers((current) => current.filter((item) => item.user_id !== userID));
      toast.success(m.teamDetail.memberRemoved, { id: loadingID });
    } catch (error) {
      const message = error instanceof Error ? error.message : m.teamDetail.memberRemoveFailed;
      toast.error(message, { id: loadingID });
    }
  }

  function onStartCreateRole() {
    setEditingRoleID("");
    setRoleID("");
    setRoleName("");
    setRoleDescription("");
    setRolePermissions("");
  }

  function onStartEditRole(role: TeamRoleRecord) {
    setEditingRoleID(role.id);
    setRoleID(role.id);
    setRoleName(role.name);
    setRoleDescription(role.description || "");
    setRolePermissions((role.permissions || []).join(","));
  }

  function parsePermissions(input: string): string[] {
    const output: string[] = [];
    const seen = new Set<string>();
    for (const item of input.split(",")) {
      const normalized = item.trim();
      if (!normalized || seen.has(normalized)) continue;
      seen.add(normalized);
      output.push(normalized);
    }
    return output;
  }

  async function onSaveRole(event: any) {
    event.preventDefault();
    if (!resolvedTeamID) return;
    const nextRoleID = roleID.trim().toLowerCase();
    const nextRoleName = roleName.trim();
    if (!nextRoleID) {
      toast.error(m.teamDetail.validationRoleIDRequired);
      return;
    }
    if (!nextRoleName) {
      toast.error(m.teamDetail.validationRoleNameRequired);
      return;
    }
    if (nextRoleID === "owner" || nextRoleID === "member") {
      toast.error(m.teamDetail.validationRoleReserved);
      return;
    }
    setIsSavingRole(true);
    const loadingID = toast.loading(editingRoleID ? m.teamDetail.updatingRoleDefinition : m.teamDetail.creatingRole);
    const payload = {
      name: nextRoleName,
      description: roleDescription.trim(),
      permissions: parsePermissions(rolePermissions),
    };
    try {
      if (editingRoleID) {
        await updateTeamRole(resolvedTeamID, editingRoleID, payload);
      } else {
        await createTeamRole(resolvedTeamID, {
          role_id: nextRoleID,
          ...payload,
        });
      }
      await refreshMembersAndRoles();
      onStartCreateRole();
      toast.success(editingRoleID ? m.teamDetail.roleDefinitionUpdated : m.teamDetail.roleCreated, { id: loadingID });
    } catch (error) {
      const message = error instanceof Error ? error.message : m.teamDetail.roleSaveFailed;
      toast.error(message, { id: loadingID });
    } finally {
      setIsSavingRole(false);
    }
  }

  async function onDeleteRole(role: TeamRoleRecord) {
    if (!resolvedTeamID) return;
    if (!role.is_editable) return;
    const confirmed = typeof window !== "undefined" ? window.confirm(m.teamDetail.roleDeleteConfirmText) : false;
    if (!confirmed) return;
    const loadingID = toast.loading(m.teamDetail.deletingRole);
    try {
      await deleteTeamRole(resolvedTeamID, role.id);
      await refreshMembersAndRoles();
      if (editingRoleID === role.id) {
        onStartCreateRole();
      }
      toast.success(m.teamDetail.roleDeleted, { id: loadingID });
    } catch (error) {
      const message = error instanceof Error ? error.message : m.teamDetail.roleDeleteFailed;
      toast.error(message, { id: loadingID });
    }
  }

  async function onSelectCurrentTeam() {
    if (!resolvedTeamID) return;
    setIsSelecting(true);
    const loadingID = toast.loading(m.teamDetail.selectingTeam);
    try {
      await selectTeam(resolvedTeamID);
      toast.success(m.teamDetail.teamSelected, { id: loadingID });
    } catch (error) {
      const message = error instanceof Error ? error.message : m.teamDetail.teamSelectFailed;
      toast.error(message, { id: loadingID });
    } finally {
      setIsSelecting(false);
    }
  }

  async function onDeleteTeam() {
    if (!resolvedTeamID) return;
    const confirmed = typeof window !== "undefined" ? window.confirm(m.teamDetail.deleteConfirmText) : false;
    if (!confirmed) return;
    setIsDeleting(true);
    const loadingID = toast.loading(m.teamDetail.deletingTeam);
    try {
      await deleteTeam(resolvedTeamID);
      toast.success(m.teamDetail.teamDeleted, { id: loadingID });
      window.location.href = "/dashboard/teams";
    } catch (error) {
      const message = error instanceof Error ? error.message : m.teamDetail.teamDeleteFailed;
      toast.error(message, { id: loadingID });
      setIsDeleting(false);
    }
  }

  if (!teamDetail) {
    return (
      <AdminPageLayout
        section={m.teamDetail.section}
        title={m.teamDetail.title}
        description={m.teamDetail.unavailableDescription}
      >
        {isLoadingDetail ? (
          <p className="text-sm text-muted-foreground">{m.teamDetail.loadingMembers}</p>
        ) : (
          <EmptyState title={m.teamDetail.unavailableTitle} description={m.teamDetail.unavailableDescription} />
        )}
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      section={m.teamDetail.section}
      title={teamDetail.team.name}
      description={`${m.teamDetail.descriptionPrefix} ${teamDetail.team.slug}.`}
    >
      <Card>
        <CardHeader>
          <CardTitle>{m.teamDetail.profileTitle}</CardTitle>
          <CardDescription>{m.teamDetail.profileDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSaveTeamProfile}>
            <div className="grid gap-3 text-sm text-foreground md:grid-cols-3">
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">{m.teamDetail.teamID}</p>
                <p className="mt-1 break-all font-medium">{teamDetail.team.id}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">{m.teamDetail.slug}</p>
                <p className="mt-1 font-medium">{teamDetail.team.slug}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">{m.teamDetail.ownerUserID}</p>
                <p className="mt-1 break-all font-medium">{ownerUserID}</p>
              </div>
            </div>
            <label className="space-y-2 block">
              <span className="text-sm font-medium text-foreground">{m.teamDetail.teamNameLabel}</span>
              <Input value={name} onChange={(event) => setName(event.currentTarget.value)} placeholder={m.teamDetail.teamNamePlaceholder} />
            </label>
            <div className="flex flex-wrap gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => void onSelectCurrentTeam()} disabled={isSelecting}>
                {isSelecting ? m.teamDetail.selectingTeam : m.teamDetail.selectTeamAction}
              </Button>
              <Button type="submit" disabled={isSavingProfile}>
                {isSavingProfile ? m.teamDetail.savingAction : m.teamDetail.saveTeamAction}
              </Button>
              <Button type="button" variant="destructive" onClick={() => void onDeleteTeam()} disabled={isDeleting}>
                {isDeleting ? m.teamDetail.deletingAction : m.teamDetail.deleteTeamAction}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{m.teamDetail.rolesTitle}</CardTitle>
          <CardDescription>{m.teamDetail.rolesDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-3" onSubmit={onSaveRole}>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-2 block">
                <span className="text-sm font-medium text-foreground">{m.teamDetail.roleIDLabel}</span>
                <Input
                  value={roleID}
                  onChange={(event) => setRoleID(event.currentTarget.value)}
                  placeholder={m.teamDetail.roleIDPlaceholder}
                  disabled={Boolean(editingRoleID)}
                />
              </label>
              <label className="space-y-2 block">
                <span className="text-sm font-medium text-foreground">{m.teamDetail.roleNameLabel}</span>
                <Input
                  value={roleName}
                  onChange={(event) => setRoleName(event.currentTarget.value)}
                  placeholder={m.teamDetail.roleNamePlaceholder}
                />
              </label>
            </div>
            <label className="space-y-2 block">
              <span className="text-sm font-medium text-foreground">{m.teamDetail.roleDescriptionLabel}</span>
              <Input
                value={roleDescription}
                onChange={(event) => setRoleDescription(event.currentTarget.value)}
                placeholder={m.teamDetail.roleDescriptionPlaceholder}
              />
            </label>
            <label className="space-y-2 block">
              <span className="text-sm font-medium text-foreground">{m.teamDetail.rolePermissionsLabel}</span>
              <Input
                value={rolePermissions}
                onChange={(event) => setRolePermissions(event.currentTarget.value)}
                placeholder={m.teamDetail.rolePermissionsPlaceholder}
              />
            </label>
            <div className="flex flex-wrap justify-end gap-2">
              {editingRoleID ? (
                <Button type="button" variant="outline" onClick={() => onStartCreateRole()}>
                  {m.teamDetail.cancelRoleEdit}
                </Button>
              ) : null}
              <Button type="submit" disabled={isSavingRole}>
                {isSavingRole
                  ? editingRoleID
                    ? m.teamDetail.savingRoleUpdate
                    : m.teamDetail.savingRoleCreate
                  : editingRoleID
                    ? m.teamDetail.updateRoleAction
                    : m.teamDetail.createRoleAction}
              </Button>
            </div>
          </form>

          {roles.length ? (
            <div className="overflow-hidden rounded-md border border-border bg-card">
              <table className="min-w-full divide-y divide-border text-left">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground">{m.teamDetail.colRoleID}</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground">{m.teamDetail.colRoleName}</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground">{m.teamDetail.colRolePermissions}</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground">{m.teamDetail.colRoleAction}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/90">
                  {roles.map((item) => (
                    <tr key={item.id} className="align-top transition-colors hover:bg-muted/50">
                      <td className="px-4 py-4 text-sm text-foreground">{item.id}</td>
                      <td className="px-4 py-4 text-sm text-foreground">
                        <div className="font-medium">{item.name}</div>
                        {item.description ? <div className="text-xs text-muted-foreground">{item.description}</div> : null}
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground">{(item.permissions || []).join(", ") || "-"}</td>
                      <td className="px-4 py-4 text-sm text-foreground">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={!item.is_editable}
                            onClick={() => onStartEditRole(item)}
                          >
                            {m.teamDetail.editRoleAction}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={!item.is_editable}
                            onClick={() => void onDeleteRole(item)}
                          >
                            {m.teamDetail.deleteRoleAction}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{m.teamDetail.invitesTitle}</CardTitle>
          <CardDescription>{m.teamDetail.invitesDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-3 md:grid-cols-[1fr_auto]" onSubmit={onInviteMember}>
            <Input
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.currentTarget.value)}
              placeholder={m.teamDetail.inviteEmailPlaceholder}
            />
            <Button type="submit" disabled={isSavingInvite}>
              {isSavingInvite ? m.teamDetail.invitingAction : m.teamDetail.inviteAction}
            </Button>
          </form>

          {isLoadingInvites ? (
            <p className="text-sm text-muted-foreground">{m.teamDetail.loadingInvites}</p>
          ) : invites.length ? (
            <div className="overflow-hidden rounded-md border border-border bg-card">
              <table className="min-w-full divide-y divide-border text-left">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground">{m.teamDetail.colInviteEmail}</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground">{m.teamDetail.colInviteStatus}</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground">{m.teamDetail.colInviteExpires}</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground">{m.teamDetail.colInviteAction}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/90">
                  {invites.map((item) => (
                    <tr key={item.id} className="align-top transition-colors hover:bg-muted/50">
                      <td className="px-4 py-4 text-sm text-foreground">{item.email}</td>
                      <td className="px-4 py-4 text-sm text-foreground">{item.status}</td>
                      <td className="px-4 py-4 text-sm text-foreground">{item.expires_at ? formatDateTime(item.expires_at) : "-"}</td>
                      <td className="px-4 py-4 text-sm text-foreground">
                        <Button type="button" size="sm" variant="outline" onClick={() => void onCancelInvite(item.id)}>
                          {m.teamDetail.cancelInviteAction}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{m.teamDetail.noInvitesDescription}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{m.teamDetail.membersTitle}</CardTitle>
          <CardDescription>{m.teamDetail.membersDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingMembers ? (
            <p className="text-sm text-muted-foreground">{m.teamDetail.loadingMembers}</p>
          ) : members.length ? (
            <div className="overflow-hidden rounded-md border border-border bg-card">
              <table className="min-w-full divide-y divide-border text-left">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground">{m.teamDetail.colName}</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground">{m.teamDetail.colEmail}</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground">{m.teamDetail.colRole}</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground">{m.teamDetail.colJoined}</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground">{m.teamDetail.colMemberAction}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/90">
                  {members.map((item) => {
                    const isOwner = item.user_id === ownerUserID || item.role.toLowerCase() === "owner";
                    return (
                      <tr key={item.id} className="align-top transition-colors hover:bg-muted/50">
                        <td className="px-4 py-4 text-sm text-foreground">{item.display_name || "-"}</td>
                        <td className="px-4 py-4 text-sm text-foreground">{item.email || "-"}</td>
                        <td className="px-4 py-4 text-sm text-foreground">
                          <select
                            className="h-9 min-w-[120px] rounded-md border border-input bg-background px-2 text-sm text-foreground"
                            value={item.role}
                            onChange={(event) => void onUpdateMemberRole(item.user_id, event.currentTarget.value)}
                            disabled={isOwner}
                          >
                            {roleOptions.map((roleID) => (
                              <option key={roleID} value={roleID}>{roleID}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-4 text-sm text-foreground">{item.created_at ? formatDateTime(item.created_at) : "-"}</td>
                        <td className="px-4 py-4 text-sm text-foreground">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => void onRemoveMember(item.user_id)}
                            disabled={isOwner}
                            title={isOwner ? m.teamDetail.removeOwnerDisabled : undefined}
                          >
                            {m.teamDetail.removeMemberAction}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{m.teamDetail.noMembersDescription}</p>
          )}
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
}
