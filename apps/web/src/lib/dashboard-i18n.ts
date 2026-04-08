import type { Locale } from "@/lib/i18n";

export type DashboardMessages = {
  sidebar: {
    workspace: string;
    navigation: string;
    account: string;
    dashboard: string;
    teams: string;
    billing: string;
    marketplace: string;
    settings: string;
    admin: string;
  };
  dashboardHome: {
    users: string;
    files: string;
    jobs: string;
    workspace: string;
    roleLabel: string;
    tenantLabel: string;
    noSessionStart: string;
    noSessionEnd: string;
  };
  teamsPage: {
    createTeam: string;
    acceptInvite: string;
    create: string;
    detail: string;
    teamDetail: string;
  };
  notFoundDescription: string;
  settingsSecurity: {
    section: string;
    title: string;
    description: string;
    password: string;
    passwordTitle: string;
    passwordDescription: string;
    sessions: string;
    sessionsTitle: string;
    sessionsDescription: string;
    passkeys: string;
    passkeysTitle: string;
    passkeysDescription: string;
    passkeysRefresh: string;
    passkeysRefreshing: string;
    passkeysRegister: string;
    passkeysRegistering: string;
    passkeysEmpty: string;
    passkeysDeviceFallback: string;
    passkeysItemTitle: string;
    passkeysCurrent: string;
    passkeysCreatedAt: string;
    passkeysCredential: string;
    passkeysDelete: string;
    passkeysDeleteTitle: string;
    passkeysDeleteDescription: string;
    passkeysCancel: string;
    passkeysConfirmDelete: string;
    passkeysLoadFailed: string;
    passkeyRegistered: string;
    passkeyRegisterFailed: string;
    passkeyDeleted: string;
    passkeyDeleteFailed: string;
  };
  settingsNav: {
    signOutTitle: string;
    signOutDescription: string;
    cancel: string;
    confirmSignOut: string;
  };
  settingsProfile: {
    title: string;
    description: string;
    loadingDescription: string;
    loadingHint: string;
    displayName: string;
    role: string;
    email: string;
    emailHint: string;
    validationDisplayNameRequired: string;
    saving: string;
    saved: string;
    saveFailed: string;
    savingButton: string;
    saveButton: string;
  };
  accountPage: {
    title: string;
    section: string;
    welcomeBack: string;
    manageAccount: string;
    description: string;
    noSession: string;
    quickLinks: string;
    summaryEmailLabel: string;
    summaryRoleLabel: string;
    summaryTenantLabel: string;
    changeEmailTitle: string;
    changeEmailDescription: string;
    changeEmailNewEmailLabel: string;
    changeEmailNewEmailPlaceholder: string;
    changeEmailCurrentPasswordLabel: string;
    changeEmailCurrentPasswordPlaceholder: string;
    changeEmailAction: string;
    changeEmailSubmitting: string;
    changeEmailSuccess: string;
    changeEmailFailed: string;
    changePasswordTitle: string;
    changePasswordDescription: string;
    changePasswordCurrentLabel: string;
    changePasswordCurrentPlaceholder: string;
    changePasswordNewLabel: string;
    changePasswordNewPlaceholder: string;
    changePasswordSubmitting: string;
    changePasswordSuccess: string;
    changePasswordFailed: string;
    deleteTitle: string;
    deleteDescription: string;
    deleteConfirmTextLabel: string;
    deleteConfirmTextPlaceholder: string;
    deletePasswordLabel: string;
    deletePasswordPlaceholder: string;
    deleteAction: string;
    deleteSubmitting: string;
    deleteSuccess: string;
    deleteFailed: string;
    validationEmailRequired: string;
    validationPasswordRequired: string;
    validationNewPasswordDifferent: string;
    deleteValidationConfirmText: string;
    deleteValidationPasswordRequired: string;
    actionSaving: string;
    actionDeleting: string;
  };
  billing: {
    credits: string;
    creditsUnit: string;
    useCreditsDescription: string;
    topupTitle: string;
    topupDescription: string;
    oneTimePayment: string;
    save: string;
    preparing: string;
    purchaseNow: string;
    transactionHistory: string;
    date: string;
    provider: string;
    paymentIntent: string;
    amount: string;
    status: string;
    noTransactions: string;
    purchaseCredits: string;
    oneTimeTopupPackage: string;
    devNotice: string;
    cancel: string;
    payNow: string;
    processing: string;
    failedLoad: string;
    failedCreateIntent: string;
    paymentSuccessful: string;
    balance: string;
    paymentConfirmFailed: string;
  };
  teams: {
    section: string;
    title: string;
    description: string;
    createPanelTitle: string;
    createPanelDescription: string;
    teamName: string;
    teamNamePlaceholder: string;
    createTeamAction: string;
    invitesPanelTitle: string;
    invitesPanelDescription: string;
    createInviteTitle: string;
    team: string;
    selectTeam: string;
    inviteEmail: string;
    inviteEmailPlaceholder: string;
    createInviteAction: string;
    acceptInviteTitle: string;
    inviteToken: string;
    inviteTokenPlaceholder: string;
    acceptInviteAction: string;
    myTeamsTitle: string;
    myTeamsDescription: string;
    colName: string;
    colSlug: string;
    colOwner: string;
    colDetail: string;
    open: string;
    noTeamsTitle: string;
    noTeamsDescription: string;
    pendingInvitesTitle: string;
    pendingInvitesDescription: string;
    colTeamID: string;
    colEmail: string;
    colStatus: string;
    colAction: string;
    accept: string;
    noPendingInvitesTitle: string;
    noPendingInvitesDescription: string;
    feedbackTitle: string;
    failedLoadTeams: string;
    teamCreated: string;
    failedCreateTeam: string;
    inviteCreated: string;
    failedCreateInvite: string;
    inviteAccepted: string;
    failedAcceptInvite: string;
  };
  teamDetail: {
    section: string;
    title: string;
    unavailableTitle: string;
    unavailableDescription: string;
    descriptionPrefix: string;
    profileTitle: string;
    profileDescription: string;
    teamID: string;
    slug: string;
    ownerUserID: string;
    membersTitle: string;
    membersDescription: string;
    colName: string;
    colEmail: string;
    colRole: string;
    colJoined: string;
    colMemberAction: string;
    noMembersTitle: string;
    noMembersDescription: string;
    teamNameLabel: string;
    teamNamePlaceholder: string;
    saveTeamAction: string;
    savingAction: string;
    selectTeamAction: string;
    selectingTeam: string;
    deleteTeamAction: string;
    deletingAction: string;
    deleteConfirmText: string;
    invitesTitle: string;
    invitesDescription: string;
    inviteEmailPlaceholder: string;
    inviteAction: string;
    invitingAction: string;
    loadingInvites: string;
    colInviteEmail: string;
    colInviteStatus: string;
    colInviteExpires: string;
    colInviteAction: string;
    cancelInviteAction: string;
    noInvitesDescription: string;
    loadingMembers: string;
    removeMemberAction: string;
    removeOwnerDisabled: string;
    failedLoadInvites: string;
    failedLoadMembers: string;
    validationTeamNameRequired: string;
    validationInviteEmailRequired: string;
    savingProfile: string;
    profileSaved: string;
    profileSaveFailed: string;
    invitingMember: string;
    inviteCreated: string;
    inviteCreateFailed: string;
    cancelingInvite: string;
    inviteCanceled: string;
    inviteCancelFailed: string;
    updatingRole: string;
    roleUpdated: string;
    roleUpdateFailed: string;
    removingMember: string;
    memberRemoved: string;
    memberRemoveFailed: string;
    teamSelected: string;
    teamSelectFailed: string;
    deletingTeam: string;
    teamDeleted: string;
    teamDeleteFailed: string;
    rolesTitle: string;
    rolesDescription: string;
    roleIDLabel: string;
    roleIDPlaceholder: string;
    roleNameLabel: string;
    roleNamePlaceholder: string;
    roleDescriptionLabel: string;
    roleDescriptionPlaceholder: string;
    rolePermissionsLabel: string;
    rolePermissionsPlaceholder: string;
    createRoleAction: string;
    updateRoleAction: string;
    savingRoleCreate: string;
    savingRoleUpdate: string;
    cancelRoleEdit: string;
    colRoleID: string;
    colRoleName: string;
    colRolePermissions: string;
    colRoleAction: string;
    editRoleAction: string;
    deleteRoleAction: string;
    validationRoleIDRequired: string;
    validationRoleNameRequired: string;
    validationRoleReserved: string;
    creatingRole: string;
    updatingRoleDefinition: string;
    roleCreated: string;
    roleDefinitionUpdated: string;
    roleSaveFailed: string;
    deletingRole: string;
    roleDeleted: string;
    roleDeleteFailed: string;
    roleDeleteConfirmText: string;
  };
  marketplace: {
    section: string;
    title: string;
    description: string;
    catalogTitle: string;
    catalogDescription: string;
    colName: string;
    colCode: string;
    colType: string;
    colCredits: string;
    colStatus: string;
    colAction: string;
    enabled: string;
    disabled: string;
    purchase: string;
    noItemsTitle: string;
    noItemsDescription: string;
    feedbackTitle: string;
    failedLoad: string;
    purchaseCompleted: string;
    currentCredits: string;
    failedPurchase: string;
  };
  sessions: {
    section: string;
    title: string;
    description: string;
    panelTitle: string;
    panelDescription: string;
    refresh: string;
    refreshing: string;
    colSession: string;
    colStatus: string;
    colExpires: string;
    colLastSeen: string;
    colAction: string;
    created: string;
    current: string;
    active: string;
    currentSession: string;
    revoke: string;
    noSessionsTitle: string;
    noSessionsDescription: string;
    feedbackTitle: string;
    failedLoad: string;
    sessionRevoked: string;
    failedRevoke: string;
    sessionTitle: string;
    deleteSessionTitle: string;
    deleteSessionDescription: string;
    cancel: string;
    confirmDelete: string;
  };
  teamInvite: {
    pageTitle: string;
    invalidLinkTitle: string;
    invalidLinkDescription: string;
    goDashboard: string;
    acceptingTitle: string;
    acceptingDescription: string;
    signInRequiredTitle: string;
    signInRequiredDescription: string;
    signInContinue: string;
    createAccount: string;
    successTitle: string;
    openTeamDashboard: string;
    goToDashboard: string;
    errorTitle: string;
    errorDefault: string;
    alreadyMember: string;
    maybeExpired: string;
    inviteToken: string;
    inviteTokenPlaceholder: string;
    tryAgain: string;
    inviteTokenRequired: string;
    joinedSuccess: string;
    failedAccept: string;
  };
};

export const dashboardMessages: Record<Locale, DashboardMessages> = {
  en: {
    sidebar: {
      workspace: "Workspace",
      navigation: "Navigation",
      account: "Account",
      dashboard: "Dashboard",
      teams: "Teams",
      billing: "Billing",
      marketplace: "Marketplace",
      settings: "Settings",
      admin: "Admin",
    },
    dashboardHome: {
      users: "Users",
      files: "Files",
      jobs: "Jobs",
      workspace: "Workspace",
      roleLabel: "role",
      tenantLabel: "tenant",
      noSessionStart: "No active session. Please",
      noSessionEnd: "to access your dashboard.",
    },
    teamsPage: {
      createTeam: "Create Team",
      acceptInvite: "Accept Invite",
      create: "Create",
      detail: "Detail",
      teamDetail: "Team Detail",
    },
    notFoundDescription: "Page not found in dashboard routes.",
    settingsSecurity: {
      section: "Security",
      title: "Password and session security",
      description: "Use reset email and session management to keep your account secure.",
      password: "Password",
      passwordTitle: "Send reset email",
      passwordDescription: "Request a password reset link sent to your email.",
      sessions: "Sessions",
      sessionsTitle: "Manage active sessions",
      sessionsDescription: "Review and revoke currently active sessions.",
      passkeys: "Passkeys",
      passkeysTitle: "Manage passkeys",
      passkeysDescription: "Manage your passwordless sign-in devices and revoke credentials you no longer trust.",
      passkeysRefresh: "Refresh",
      passkeysRefreshing: "Refreshing...",
      passkeysRegister: "Register passkey",
      passkeysRegistering: "Registering...",
      passkeysEmpty: "No passkeys found. Register one from sign-in to enable passwordless login.",
      passkeysDeviceFallback: "Unknown device",
      passkeysItemTitle: "Passkey",
      passkeysCurrent: "Current device",
      passkeysCreatedAt: "Created",
      passkeysCredential: "Credential",
      passkeysDelete: "Delete passkey",
      passkeysDeleteTitle: "Delete passkey?",
      passkeysDeleteDescription: "This passkey will be removed from your account. This action cannot be undone.",
      passkeysCancel: "Cancel",
      passkeysConfirmDelete: "Delete passkey",
      passkeysLoadFailed: "Failed to load passkeys",
      passkeyRegistered: "Passkey registered",
      passkeyRegisterFailed: "Failed to register passkey",
      passkeyDeleted: "Passkey deleted",
      passkeyDeleteFailed: "Failed to delete passkey",
    },
    settingsNav: {
      signOutTitle: "Sign out?",
      signOutDescription: "Are you sure you want to sign out of your account?",
      cancel: "Cancel",
      confirmSignOut: "Sign out",
    },
    settingsProfile: {
      title: "Profile Settings",
      description: "Update your personal information and account identity.",
      loadingDescription: "Loading profile information.",
      loadingHint: "Please wait...",
      displayName: "Display Name",
      role: "Role",
      email: "Email",
      emailHint: "This email is used to sign in.",
      validationDisplayNameRequired: "Display name is required.",
      saving: "Saving profile...",
      saved: "Profile updated",
      saveFailed: "Failed to save profile",
      savingButton: "Saving...",
      saveButton: "Save changes",
    },
    accountPage: {
      title: "Account",
      section: "Account",
      welcomeBack: "Welcome back",
      manageAccount: "Manage your account",
      description: "Review identity, role scope, and account access in one place.",
      noSession: "No active session. Sign in to view your account profile.",
      quickLinks: "Quick Links",
      summaryEmailLabel: "Email",
      summaryRoleLabel: "Role",
      summaryTenantLabel: "Tenant",
      changeEmailTitle: "Change email",
      changeEmailDescription: "Update your sign-in email by confirming your current password.",
      changeEmailNewEmailLabel: "New email",
      changeEmailNewEmailPlaceholder: "name@example.com",
      changeEmailCurrentPasswordLabel: "Current password",
      changeEmailCurrentPasswordPlaceholder: "Enter current password",
      changeEmailAction: "Save email",
      changeEmailSubmitting: "Saving email...",
      changeEmailSuccess: "Email updated.",
      changeEmailFailed: "Failed to update email",
      changePasswordTitle: "Change password",
      changePasswordDescription: "Set a new password for this account.",
      changePasswordCurrentLabel: "Current password",
      changePasswordCurrentPlaceholder: "Enter current password",
      changePasswordNewLabel: "New password",
      changePasswordNewPlaceholder: "Enter new password",
      changePasswordSubmitting: "Saving password...",
      changePasswordSuccess: "Password updated.",
      changePasswordFailed: "Failed to update password",
      deleteTitle: "Delete account",
      deleteDescription: "This action is irreversible. Your account will be deactivated immediately.",
      deleteConfirmTextLabel: "Type DELETE to confirm",
      deleteConfirmTextPlaceholder: "DELETE",
      deletePasswordLabel: "Current password",
      deletePasswordPlaceholder: "Enter current password",
      deleteAction: "Delete account",
      deleteSubmitting: "Deleting account...",
      deleteSuccess: "Account deleted.",
      deleteFailed: "Failed to delete account",
      validationEmailRequired: "New email and current password are required.",
      validationPasswordRequired: "Current password and new password are required.",
      validationNewPasswordDifferent: "New password must be different from current password.",
      deleteValidationConfirmText: "Please type DELETE to confirm account deletion.",
      deleteValidationPasswordRequired: "Current password is required for account deletion.",
      actionSaving: "Saving...",
      actionDeleting: "Deleting...",
    },
    billing: {
      credits: "Credits",
      creditsUnit: "credits",
      useCreditsDescription: "Use credits in marketplace and feature modules.",
      topupTitle: "Top up your credits",
      topupDescription: "Purchase additional credits. The larger package has better unit price.",
      oneTimePayment: "one-time payment",
      save: "Save",
      preparing: "Preparing...",
      purchaseNow: "Purchase Now",
      transactionHistory: "Transaction History",
      date: "Date",
      provider: "Provider",
      paymentIntent: "Payment Intent",
      amount: "Amount",
      status: "Status",
      noTransactions: "No transactions yet.",
      purchaseCredits: "Purchase Credits",
      oneTimeTopupPackage: "One-time top-up package",
      devNotice:
        "This template currently confirms payment in-app for development parity. Stripe Elements UI can be plugged in with real client_secret later.",
      cancel: "Cancel",
      payNow: "Pay Now",
      processing: "Processing...",
      failedLoad: "Failed to load billing data",
      failedCreateIntent: "Failed to create payment intent",
      paymentSuccessful: "Payment successful.",
      balance: "balance",
      paymentConfirmFailed: "Payment confirmation failed",
    },
    teams: {
      section: "Teams",
      title: "Teams",
      description: "Create teams, invite members, and accept invitations.",
      createPanelTitle: "Create Team",
      createPanelDescription: "Create a team under your current tenant.",
      teamName: "Team Name",
      teamNamePlaceholder: "My Team",
      createTeamAction: "Create team",
      invitesPanelTitle: "Team Invites",
      invitesPanelDescription: "Invite a member by email and accept invite token.",
      createInviteTitle: "Create Invite",
      team: "Team",
      selectTeam: "Select a team",
      inviteEmail: "Invite Email",
      inviteEmailPlaceholder: "member@example.com",
      createInviteAction: "Create invite",
      acceptInviteTitle: "Accept Invite",
      inviteToken: "Invite Token",
      inviteTokenPlaceholder: "Paste invite token",
      acceptInviteAction: "Accept invite",
      myTeamsTitle: "My Teams",
      myTeamsDescription: "Teams where the current account is a member.",
      colName: "Name",
      colSlug: "Slug",
      colOwner: "Owner User ID",
      colDetail: "Detail",
      open: "Open",
      noTeamsTitle: "No teams yet",
      noTeamsDescription: "Create your first team to start collaboration.",
      pendingInvitesTitle: "Pending Invitations",
      pendingInvitesDescription: "Invitations waiting for your acceptance.",
      colTeamID: "Team ID",
      colEmail: "Email",
      colStatus: "Status",
      colAction: "Action",
      accept: "Accept",
      noPendingInvitesTitle: "No pending invites",
      noPendingInvitesDescription: "When invited, pending team invites will appear here.",
      feedbackTitle: "Teams feedback",
      failedLoadTeams: "Failed to load teams",
      teamCreated: "Team created",
      failedCreateTeam: "Failed to create team",
      inviteCreated: "Invite created",
      failedCreateInvite: "Failed to create invite",
      inviteAccepted: "Invite accepted",
      failedAcceptInvite: "Failed to accept invite",
    },
    teamDetail: {
      section: "Teams",
      title: "Team Detail",
      unavailableTitle: "Team unavailable",
      unavailableDescription: "Please go back to teams list and choose another team.",
      descriptionPrefix: "Manage team members and access for",
      profileTitle: "Team Profile",
      profileDescription: "Tenant-scoped team metadata.",
      teamID: "Team ID",
      slug: "Slug",
      ownerUserID: "Owner User ID",
      membersTitle: "Members",
      membersDescription: "Current team membership list.",
      colName: "Name",
      colEmail: "Email",
      colRole: "Role",
      colJoined: "Joined",
      colMemberAction: "Action",
      noMembersTitle: "No members",
      noMembersDescription: "Invite members to start collaboration.",
      teamNameLabel: "Team name",
      teamNamePlaceholder: "Enter team name",
      saveTeamAction: "Save team",
      savingAction: "Saving...",
      selectTeamAction: "Set as current team",
      selectingTeam: "Selecting...",
      deleteTeamAction: "Delete team",
      deletingAction: "Deleting...",
      deleteConfirmText: "Delete this team permanently?",
      invitesTitle: "Pending invites",
      invitesDescription: "Create and manage invitations for this team.",
      inviteEmailPlaceholder: "member@example.com",
      inviteAction: "Invite member",
      invitingAction: "Inviting...",
      loadingInvites: "Loading invites...",
      colInviteEmail: "Email",
      colInviteStatus: "Status",
      colInviteExpires: "Expires",
      colInviteAction: "Action",
      cancelInviteAction: "Cancel",
      noInvitesDescription: "No pending invitations.",
      loadingMembers: "Loading members...",
      removeMemberAction: "Remove",
      removeOwnerDisabled: "Team owner cannot be removed.",
      failedLoadInvites: "Failed to load team invites",
      failedLoadMembers: "Failed to load team members",
      validationTeamNameRequired: "Team name is required.",
      validationInviteEmailRequired: "Invite email is required.",
      savingProfile: "Saving team profile...",
      profileSaved: "Team profile updated.",
      profileSaveFailed: "Failed to update team profile",
      invitingMember: "Creating invite...",
      inviteCreated: "Invite created.",
      inviteCreateFailed: "Failed to create invite",
      cancelingInvite: "Canceling invite...",
      inviteCanceled: "Invite canceled.",
      inviteCancelFailed: "Failed to cancel invite",
      updatingRole: "Updating role...",
      roleUpdated: "Role updated.",
      roleUpdateFailed: "Failed to update role",
      removingMember: "Removing member...",
      memberRemoved: "Member removed.",
      memberRemoveFailed: "Failed to remove member",
      teamSelected: "Team selected.",
      teamSelectFailed: "Failed to select team",
      deletingTeam: "Deleting team...",
      teamDeleted: "Team deleted.",
      teamDeleteFailed: "Failed to delete team",
      rolesTitle: "Custom Roles",
      rolesDescription: "Create and maintain custom roles for this team.",
      roleIDLabel: "Role ID",
      roleIDPlaceholder: "analyst",
      roleNameLabel: "Role Name",
      roleNamePlaceholder: "Analyst",
      roleDescriptionLabel: "Role Description",
      roleDescriptionPlaceholder: "Read-only analytics access",
      rolePermissionsLabel: "Permissions (comma separated)",
      rolePermissionsPlaceholder: "teams.read,dashboard.read",
      createRoleAction: "Create role",
      updateRoleAction: "Update role",
      savingRoleCreate: "Creating...",
      savingRoleUpdate: "Updating...",
      cancelRoleEdit: "Cancel",
      colRoleID: "Role ID",
      colRoleName: "Role",
      colRolePermissions: "Permissions",
      colRoleAction: "Action",
      editRoleAction: "Edit",
      deleteRoleAction: "Delete",
      validationRoleIDRequired: "Role ID is required.",
      validationRoleNameRequired: "Role name is required.",
      validationRoleReserved: "owner/member are reserved system roles.",
      creatingRole: "Creating role...",
      updatingRoleDefinition: "Updating role...",
      roleCreated: "Role created.",
      roleDefinitionUpdated: "Role updated.",
      roleSaveFailed: "Failed to save role",
      deletingRole: "Deleting role...",
      roleDeleted: "Role deleted.",
      roleDeleteFailed: "Failed to delete role",
      roleDeleteConfirmText: "Delete this custom role?",
    },
    marketplace: {
      section: "Marketplace",
      title: "Marketplace",
      description: "Available credit packages and marketplace catalog items.",
      catalogTitle: "Catalog",
      catalogDescription: "Catalog is loaded from /api/v1/marketplace/catalog.",
      colName: "Name",
      colCode: "Code",
      colType: "Type",
      colCredits: "Credits",
      colStatus: "Status",
      colAction: "Action",
      enabled: "Enabled",
      disabled: "Disabled",
      purchase: "Purchase",
      noItemsTitle: "No marketplace items",
      noItemsDescription: "Catalog will appear after backend seeding.",
      feedbackTitle: "Marketplace feedback",
      failedLoad: "Failed to load marketplace catalog",
      purchaseCompleted: "Purchase completed.",
      currentCredits: "Current credits",
      failedPurchase: "Failed to purchase item",
    },
    sessions: {
      section: "Security",
      title: "Sessions",
      description: "View and revoke active login sessions.",
      panelTitle: "Active Sessions",
      panelDescription: "Current account sessions across devices and browsers.",
      refresh: "Refresh",
      refreshing: "Refreshing...",
      colSession: "Session",
      colStatus: "Status",
      colExpires: "Expires",
      colLastSeen: "Last Seen",
      colAction: "Action",
      created: "Created",
      current: "Current",
      active: "Active",
      currentSession: "Current Session",
      revoke: "Revoke",
      noSessionsTitle: "No active sessions",
      noSessionsDescription: "Sign in to create a new session.",
      feedbackTitle: "Session feedback",
      failedLoad: "Failed to load sessions",
      sessionRevoked: "Session revoked",
      failedRevoke: "Failed to revoke session",
      sessionTitle: "Active session",
      deleteSessionTitle: "Delete session?",
      deleteSessionDescription: "This will sign out this device. This action cannot be undone.",
      cancel: "Cancel",
      confirmDelete: "Delete session",
    },
    teamInvite: {
      pageTitle: "Team Invite",
      invalidLinkTitle: "Invalid Invitation Link",
      invalidLinkDescription: "The invitation link is invalid or has expired.",
      goDashboard: "Go to Dashboard",
      acceptingTitle: "Accepting Invitation",
      acceptingDescription: "Please wait while we process your team invitation...",
      signInRequiredTitle: "Sign in required",
      signInRequiredDescription: "Sign in to accept this team invitation.",
      signInContinue: "Sign in and continue",
      createAccount: "Create account",
      successTitle: "Invitation accepted",
      openTeamDashboard: "Open team dashboard",
      goToDashboard: "Go to dashboard",
      errorTitle: "Invitation Error",
      errorDefault: "Failed to process the invitation.",
      alreadyMember: "You are already a member of this team.",
      maybeExpired: "The invitation may have expired or been revoked.",
      inviteToken: "Invite Token",
      inviteTokenPlaceholder: "Paste invite token",
      tryAgain: "Try again",
      inviteTokenRequired: "Invite token is required.",
      joinedSuccess: "You've successfully joined the team.",
      failedAccept: "Failed to accept team invitation",
    },
  },
  zh: {
    sidebar: {
      workspace: "工作区",
      navigation: "导航",
      account: "账户",
      dashboard: "控制台",
      teams: "团队",
      billing: "账单",
      marketplace: "市场",
      settings: "设置",
      admin: "管理后台",
    },
    dashboardHome: {
      users: "用户",
      files: "文件",
      jobs: "任务",
      workspace: "工作区",
      roleLabel: "角色",
      tenantLabel: "租户",
      noSessionStart: "当前无登录会话，请先",
      noSessionEnd: "后访问控制台。",
    },
    teamsPage: {
      createTeam: "创建团队",
      acceptInvite: "接受邀请",
      create: "创建",
      detail: "详情",
      teamDetail: "团队详情",
    },
    notFoundDescription: "当前页面不在控制台路由中。",
    settingsSecurity: {
      section: "安全",
      title: "密码与会话安全",
      description: "通过重置邮件和会话管理来保护你的账户安全。",
      password: "密码",
      passwordTitle: "发送重置邮件",
      passwordDescription: "向你的邮箱发送密码重置链接。",
      sessions: "会话",
      sessionsTitle: "管理活跃会话",
      sessionsDescription: "查看并撤销当前活跃会话。",
      passkeys: "Passkey",
      passkeysTitle: "管理 Passkey",
      passkeysDescription: "管理无密码登录设备，并删除不再信任的凭证。",
      passkeysRefresh: "刷新",
      passkeysRefreshing: "刷新中...",
      passkeysRegister: "注册 Passkey",
      passkeysRegistering: "注册中...",
      passkeysEmpty: "暂无 Passkey，可在登录页注册后启用无密码登录。",
      passkeysDeviceFallback: "未知设备",
      passkeysItemTitle: "Passkey",
      passkeysCurrent: "当前设备",
      passkeysCreatedAt: "创建时间",
      passkeysCredential: "凭证 ID",
      passkeysDelete: "删除 Passkey",
      passkeysDeleteTitle: "确认删除该 Passkey？",
      passkeysDeleteDescription: "删除后该 Passkey 将无法继续用于登录，且无法恢复。",
      passkeysCancel: "取消",
      passkeysConfirmDelete: "删除 Passkey",
      passkeysLoadFailed: "加载 Passkey 失败",
      passkeyRegistered: "Passkey 已注册",
      passkeyRegisterFailed: "注册 Passkey 失败",
      passkeyDeleted: "Passkey 已删除",
      passkeyDeleteFailed: "删除 Passkey 失败",
    },
    settingsNav: {
      signOutTitle: "确认退出登录？",
      signOutDescription: "退出后你需要重新登录才能继续访问。",
      cancel: "取消",
      confirmSignOut: "退出登录",
    },
    settingsProfile: {
      title: "个人资料设置",
      description: "更新你的个人资料和账户身份信息。",
      loadingDescription: "正在加载个人资料。",
      loadingHint: "请稍候...",
      displayName: "显示名称",
      role: "角色",
      email: "邮箱",
      emailHint: "该邮箱用于登录账户。",
      validationDisplayNameRequired: "显示名称不能为空。",
      saving: "正在保存资料...",
      saved: "资料已更新",
      saveFailed: "保存资料失败",
      savingButton: "保存中...",
      saveButton: "保存修改",
    },
    accountPage: {
      title: "账户",
      section: "账户",
      welcomeBack: "欢迎回来",
      manageAccount: "管理你的账户",
      description: "在一个页面查看身份、角色范围与账户访问状态。",
      noSession: "当前无登录会话。请先登录后查看账户信息。",
      quickLinks: "快捷入口",
      summaryEmailLabel: "邮箱",
      summaryRoleLabel: "角色",
      summaryTenantLabel: "租户",
      changeEmailTitle: "修改邮箱",
      changeEmailDescription: "通过当前密码确认后更新登录邮箱。",
      changeEmailNewEmailLabel: "新邮箱",
      changeEmailNewEmailPlaceholder: "name@example.com",
      changeEmailCurrentPasswordLabel: "当前密码",
      changeEmailCurrentPasswordPlaceholder: "输入当前密码",
      changeEmailAction: "保存邮箱",
      changeEmailSubmitting: "正在保存邮箱...",
      changeEmailSuccess: "邮箱已更新。",
      changeEmailFailed: "更新邮箱失败",
      changePasswordTitle: "修改密码",
      changePasswordDescription: "为当前账户设置新密码。",
      changePasswordCurrentLabel: "当前密码",
      changePasswordCurrentPlaceholder: "输入当前密码",
      changePasswordNewLabel: "新密码",
      changePasswordNewPlaceholder: "输入新密码",
      changePasswordSubmitting: "正在保存密码...",
      changePasswordSuccess: "密码已更新。",
      changePasswordFailed: "更新密码失败",
      deleteTitle: "删除账户",
      deleteDescription: "该操作不可恢复，账户会立即被停用。",
      deleteConfirmTextLabel: "输入 DELETE 确认",
      deleteConfirmTextPlaceholder: "DELETE",
      deletePasswordLabel: "当前密码",
      deletePasswordPlaceholder: "输入当前密码",
      deleteAction: "删除账户",
      deleteSubmitting: "正在删除账户...",
      deleteSuccess: "账户已删除。",
      deleteFailed: "删除账户失败",
      validationEmailRequired: "新邮箱和当前密码不能为空。",
      validationPasswordRequired: "当前密码和新密码不能为空。",
      validationNewPasswordDifferent: "新密码不能与当前密码相同。",
      deleteValidationConfirmText: "请输入 DELETE 以确认删除账户。",
      deleteValidationPasswordRequired: "删除账户需要输入当前密码。",
      actionSaving: "保存中...",
      actionDeleting: "删除中...",
    },
    billing: {
      credits: "积分",
      creditsUnit: "积分",
      useCreditsDescription: "积分可用于市场购买和功能模块调用。",
      topupTitle: "充值积分",
      topupDescription: "购买更多积分，套餐越大单位价格越优。",
      oneTimePayment: "一次性支付",
      save: "节省",
      preparing: "准备中...",
      purchaseNow: "立即购买",
      transactionHistory: "交易记录",
      date: "时间",
      provider: "渠道",
      paymentIntent: "支付意图",
      amount: "数量",
      status: "状态",
      noTransactions: "暂无交易记录。",
      purchaseCredits: "购买积分",
      oneTimeTopupPackage: "一次性充值套餐",
      devNotice: "当前模板在开发环境使用站内确认支付流程。后续可接入真实 Stripe Elements + client_secret。",
      cancel: "取消",
      payNow: "立即支付",
      processing: "处理中...",
      failedLoad: "加载账单数据失败",
      failedCreateIntent: "创建支付意图失败",
      paymentSuccessful: "支付成功。",
      balance: "余额",
      paymentConfirmFailed: "支付确认失败",
    },
    teams: {
      section: "团队",
      title: "团队",
      description: "创建团队、邀请成员并接受邀请。",
      createPanelTitle: "创建团队",
      createPanelDescription: "在当前租户下创建团队。",
      teamName: "团队名称",
      teamNamePlaceholder: "我的团队",
      createTeamAction: "创建团队",
      invitesPanelTitle: "团队邀请",
      invitesPanelDescription: "通过邮箱邀请成员，并可使用 token 接受邀请。",
      createInviteTitle: "创建邀请",
      team: "团队",
      selectTeam: "选择团队",
      inviteEmail: "邀请邮箱",
      inviteEmailPlaceholder: "member@example.com",
      createInviteAction: "创建邀请",
      acceptInviteTitle: "接受邀请",
      inviteToken: "邀请 Token",
      inviteTokenPlaceholder: "粘贴邀请 token",
      acceptInviteAction: "接受邀请",
      myTeamsTitle: "我的团队",
      myTeamsDescription: "当前账户所属的团队列表。",
      colName: "名称",
      colSlug: "标识",
      colOwner: "所有者用户 ID",
      colDetail: "详情",
      open: "打开",
      noTeamsTitle: "暂无团队",
      noTeamsDescription: "先创建第一个团队再开始协作。",
      pendingInvitesTitle: "待处理邀请",
      pendingInvitesDescription: "等待你接受的邀请会显示在这里。",
      colTeamID: "团队 ID",
      colEmail: "邮箱",
      colStatus: "状态",
      colAction: "操作",
      accept: "接受",
      noPendingInvitesTitle: "暂无待处理邀请",
      noPendingInvitesDescription: "有新邀请时会自动展示在这里。",
      feedbackTitle: "团队反馈",
      failedLoadTeams: "加载团队失败",
      teamCreated: "团队已创建",
      failedCreateTeam: "创建团队失败",
      inviteCreated: "邀请已创建",
      failedCreateInvite: "创建邀请失败",
      inviteAccepted: "邀请已接受",
      failedAcceptInvite: "接受邀请失败",
    },
    teamDetail: {
      section: "团队",
      title: "团队详情",
      unavailableTitle: "团队不可用",
      unavailableDescription: "请返回团队列表并选择其他团队。",
      descriptionPrefix: "管理团队成员与访问权限：",
      profileTitle: "团队信息",
      profileDescription: "租户范围内的团队元数据。",
      teamID: "团队 ID",
      slug: "标识",
      ownerUserID: "所有者用户 ID",
      membersTitle: "成员",
      membersDescription: "当前团队成员列表。",
      colName: "名称",
      colEmail: "邮箱",
      colRole: "角色",
      colJoined: "加入时间",
      colMemberAction: "操作",
      noMembersTitle: "暂无成员",
      noMembersDescription: "邀请成员后即可开始协作。",
      teamNameLabel: "团队名称",
      teamNamePlaceholder: "输入团队名称",
      saveTeamAction: "保存团队",
      savingAction: "保存中...",
      selectTeamAction: "设为当前团队",
      selectingTeam: "切换中...",
      deleteTeamAction: "删除团队",
      deletingAction: "删除中...",
      deleteConfirmText: "确认永久删除该团队吗？",
      invitesTitle: "待处理邀请",
      invitesDescription: "创建并管理当前团队的邀请。",
      inviteEmailPlaceholder: "member@example.com",
      inviteAction: "邀请成员",
      invitingAction: "邀请中...",
      loadingInvites: "正在加载邀请...",
      colInviteEmail: "邮箱",
      colInviteStatus: "状态",
      colInviteExpires: "过期时间",
      colInviteAction: "操作",
      cancelInviteAction: "取消",
      noInvitesDescription: "暂无待处理邀请。",
      loadingMembers: "正在加载成员...",
      removeMemberAction: "移除",
      removeOwnerDisabled: "团队所有者不可移除。",
      failedLoadInvites: "加载团队邀请失败",
      failedLoadMembers: "加载团队成员失败",
      validationTeamNameRequired: "团队名称不能为空。",
      validationInviteEmailRequired: "邀请邮箱不能为空。",
      savingProfile: "正在保存团队信息...",
      profileSaved: "团队信息已更新。",
      profileSaveFailed: "更新团队信息失败",
      invitingMember: "正在创建邀请...",
      inviteCreated: "邀请已创建。",
      inviteCreateFailed: "创建邀请失败",
      cancelingInvite: "正在取消邀请...",
      inviteCanceled: "邀请已取消。",
      inviteCancelFailed: "取消邀请失败",
      updatingRole: "正在更新角色...",
      roleUpdated: "角色已更新。",
      roleUpdateFailed: "更新角色失败",
      removingMember: "正在移除成员...",
      memberRemoved: "成员已移除。",
      memberRemoveFailed: "移除成员失败",
      teamSelected: "已切换到该团队。",
      teamSelectFailed: "切换团队失败",
      deletingTeam: "正在删除团队...",
      teamDeleted: "团队已删除。",
      teamDeleteFailed: "删除团队失败",
      rolesTitle: "自定义角色",
      rolesDescription: "为当前团队创建并维护自定义角色。",
      roleIDLabel: "角色 ID",
      roleIDPlaceholder: "analyst",
      roleNameLabel: "角色名称",
      roleNamePlaceholder: "分析师",
      roleDescriptionLabel: "角色描述",
      roleDescriptionPlaceholder: "只读分析权限",
      rolePermissionsLabel: "权限（逗号分隔）",
      rolePermissionsPlaceholder: "teams.read,dashboard.read",
      createRoleAction: "创建角色",
      updateRoleAction: "更新角色",
      savingRoleCreate: "创建中...",
      savingRoleUpdate: "更新中...",
      cancelRoleEdit: "取消",
      colRoleID: "角色 ID",
      colRoleName: "角色",
      colRolePermissions: "权限",
      colRoleAction: "操作",
      editRoleAction: "编辑",
      deleteRoleAction: "删除",
      validationRoleIDRequired: "角色 ID 不能为空。",
      validationRoleNameRequired: "角色名称不能为空。",
      validationRoleReserved: "owner/member 为系统保留角色。",
      creatingRole: "正在创建角色...",
      updatingRoleDefinition: "正在更新角色...",
      roleCreated: "角色已创建。",
      roleDefinitionUpdated: "角色已更新。",
      roleSaveFailed: "保存角色失败",
      deletingRole: "正在删除角色...",
      roleDeleted: "角色已删除。",
      roleDeleteFailed: "删除角色失败",
      roleDeleteConfirmText: "确认删除该自定义角色？",
    },
    marketplace: {
      section: "市场",
      title: "市场",
      description: "可购买的积分套餐与市场目录项。",
      catalogTitle: "目录",
      catalogDescription: "目录数据来源于 /api/v1/marketplace/catalog。",
      colName: "名称",
      colCode: "编码",
      colType: "类型",
      colCredits: "积分",
      colStatus: "状态",
      colAction: "操作",
      enabled: "启用",
      disabled: "停用",
      purchase: "购买",
      noItemsTitle: "暂无市场商品",
      noItemsDescription: "后端种子数据写入后会显示目录。",
      feedbackTitle: "市场反馈",
      failedLoad: "加载市场目录失败",
      purchaseCompleted: "购买完成。",
      currentCredits: "当前积分",
      failedPurchase: "购买失败",
    },
    sessions: {
      section: "安全",
      title: "会话",
      description: "查看并撤销当前活跃登录会话。",
      panelTitle: "活跃会话",
      panelDescription: "当前账户在各设备和浏览器的会话。",
      refresh: "刷新",
      refreshing: "刷新中...",
      colSession: "会话",
      colStatus: "状态",
      colExpires: "过期时间",
      colLastSeen: "最近访问",
      colAction: "操作",
      created: "创建时间",
      current: "当前",
      active: "活跃",
      currentSession: "当前会话",
      revoke: "撤销",
      noSessionsTitle: "暂无活跃会话",
      noSessionsDescription: "登录后会创建新的会话。",
      feedbackTitle: "会话反馈",
      failedLoad: "加载会话失败",
      sessionRevoked: "会话已撤销",
      failedRevoke: "撤销会话失败",
      sessionTitle: "活跃会话",
      deleteSessionTitle: "确认删除该会话？",
      deleteSessionDescription: "删除后该设备会立即退出登录，且无法恢复。",
      cancel: "取消",
      confirmDelete: "删除会话",
    },
    teamInvite: {
      pageTitle: "团队邀请",
      invalidLinkTitle: "无效邀请链接",
      invalidLinkDescription: "邀请链接无效或已过期。",
      goDashboard: "前往控制台",
      acceptingTitle: "正在接受邀请",
      acceptingDescription: "正在处理你的团队邀请，请稍候...",
      signInRequiredTitle: "需要登录",
      signInRequiredDescription: "请先登录后再接受团队邀请。",
      signInContinue: "登录并继续",
      createAccount: "创建账户",
      successTitle: "邀请已接受",
      openTeamDashboard: "打开团队控制台",
      goToDashboard: "前往控制台",
      errorTitle: "邀请处理失败",
      errorDefault: "处理邀请失败。",
      alreadyMember: "你已经是该团队成员。",
      maybeExpired: "邀请可能已过期或已被撤销。",
      inviteToken: "邀请 Token",
      inviteTokenPlaceholder: "粘贴邀请 token",
      tryAgain: "重试",
      inviteTokenRequired: "邀请 token 不能为空。",
      joinedSuccess: "你已成功加入团队。",
      failedAccept: "接受团队邀请失败",
    },
  },
  ja: {
    sidebar: {
      workspace: "ワークスペース",
      navigation: "ナビゲーション",
      account: "アカウント",
      dashboard: "ダッシュボード",
      teams: "チーム",
      billing: "請求",
      marketplace: "マーケットプレイス",
      settings: "設定",
      admin: "管理",
    },
    dashboardHome: {
      users: "ユーザー",
      files: "ファイル",
      jobs: "ジョブ",
      workspace: "ワークスペース",
      roleLabel: "role",
      tenantLabel: "tenant",
      noSessionStart: "有効なセッションがありません。ダッシュボードにアクセスするには",
      noSessionEnd: "してください。",
    },
    teamsPage: {
      createTeam: "チーム作成",
      acceptInvite: "招待を承認",
      create: "作成",
      detail: "詳細",
      teamDetail: "チーム詳細",
    },
    notFoundDescription: "ダッシュボード内のルートが見つかりません。",
    settingsSecurity: {
      section: "セキュリティ",
      title: "パスワードとセッションのセキュリティ",
      description: "リセットメールとセッション管理でアカウントを保護します。",
      password: "パスワード",
      passwordTitle: "リセットメール送信",
      passwordDescription: "パスワードリセットリンクをメールに送信します。",
      sessions: "セッション",
      sessionsTitle: "アクティブセッション管理",
      sessionsDescription: "現在のアクティブセッションを確認し無効化できます。",
      passkeys: "Passkeys",
      passkeysTitle: "Passkey 管理",
      passkeysDescription: "パスワードレスサインイン用デバイスを管理し、不要な認証情報を削除できます。",
      passkeysRefresh: "更新",
      passkeysRefreshing: "更新中...",
      passkeysRegister: "Passkey 登録",
      passkeysRegistering: "登録中...",
      passkeysEmpty: "Passkey がありません。サインイン画面で登録するとパスワードレス認証を利用できます。",
      passkeysDeviceFallback: "不明なデバイス",
      passkeysItemTitle: "Passkey",
      passkeysCurrent: "現在のデバイス",
      passkeysCreatedAt: "作成日時",
      passkeysCredential: "Credential",
      passkeysDelete: "Passkey を削除",
      passkeysDeleteTitle: "Passkey を削除しますか？",
      passkeysDeleteDescription: "この Passkey はアカウントから削除されます。この操作は取り消せません。",
      passkeysCancel: "キャンセル",
      passkeysConfirmDelete: "Passkey を削除",
      passkeysLoadFailed: "Passkey の読み込みに失敗しました",
      passkeyRegistered: "Passkey を登録しました",
      passkeyRegisterFailed: "Passkey の登録に失敗しました",
      passkeyDeleted: "Passkey を削除しました",
      passkeyDeleteFailed: "Passkey の削除に失敗しました",
    },
    settingsNav: {
      signOutTitle: "サインアウトしますか？",
      signOutDescription: "アカウントからサインアウトしてもよろしいですか？",
      cancel: "キャンセル",
      confirmSignOut: "サインアウト",
    },
    settingsProfile: {
      title: "プロフィール設定",
      description: "個人情報とアカウント情報を更新します。",
      loadingDescription: "プロフィール情報を読み込み中。",
      loadingHint: "しばらくお待ちください...",
      displayName: "表示名",
      role: "ロール",
      email: "メール",
      emailHint: "このメールアドレスはサインインに使用されます。",
      validationDisplayNameRequired: "表示名は必須です。",
      saving: "プロフィールを保存中...",
      saved: "プロフィールを更新しました",
      saveFailed: "プロフィールの保存に失敗しました",
      savingButton: "保存中...",
      saveButton: "変更を保存",
    },
    accountPage: {
      title: "アカウント",
      section: "アカウント",
      welcomeBack: "おかえりなさい",
      manageAccount: "アカウントを管理",
      description: "ID、ロール範囲、アクセス状況を一箇所で確認できます。",
      noSession: "有効なセッションがありません。ログインしてアカウント情報を確認してください。",
      quickLinks: "クイックリンク",
      summaryEmailLabel: "メール",
      summaryRoleLabel: "ロール",
      summaryTenantLabel: "テナント",
      changeEmailTitle: "メール変更",
      changeEmailDescription: "現在のパスワード確認後にサインイン用メールを更新します。",
      changeEmailNewEmailLabel: "新しいメール",
      changeEmailNewEmailPlaceholder: "name@example.com",
      changeEmailCurrentPasswordLabel: "現在のパスワード",
      changeEmailCurrentPasswordPlaceholder: "現在のパスワードを入力",
      changeEmailAction: "メールを保存",
      changeEmailSubmitting: "メールを保存中...",
      changeEmailSuccess: "メールを更新しました。",
      changeEmailFailed: "メールの更新に失敗しました",
      changePasswordTitle: "パスワード変更",
      changePasswordDescription: "このアカウントの新しいパスワードを設定します。",
      changePasswordCurrentLabel: "現在のパスワード",
      changePasswordCurrentPlaceholder: "現在のパスワードを入力",
      changePasswordNewLabel: "新しいパスワード",
      changePasswordNewPlaceholder: "新しいパスワードを入力",
      changePasswordSubmitting: "パスワードを保存中...",
      changePasswordSuccess: "パスワードを更新しました。",
      changePasswordFailed: "パスワードの更新に失敗しました",
      deleteTitle: "アカウント削除",
      deleteDescription: "この操作は取り消せません。アカウントは直ちに無効化されます。",
      deleteConfirmTextLabel: "確認のため DELETE と入力",
      deleteConfirmTextPlaceholder: "DELETE",
      deletePasswordLabel: "現在のパスワード",
      deletePasswordPlaceholder: "現在のパスワードを入力",
      deleteAction: "アカウント削除",
      deleteSubmitting: "アカウント削除中...",
      deleteSuccess: "アカウントを削除しました。",
      deleteFailed: "アカウント削除に失敗しました",
      validationEmailRequired: "新しいメールと現在のパスワードは必須です。",
      validationPasswordRequired: "現在のパスワードと新しいパスワードは必須です。",
      validationNewPasswordDifferent: "新しいパスワードは現在のパスワードと異なる必要があります。",
      deleteValidationConfirmText: "アカウント削除確認のため DELETE を入力してください。",
      deleteValidationPasswordRequired: "アカウント削除には現在のパスワードが必要です。",
      actionSaving: "保存中...",
      actionDeleting: "削除中...",
    },
    billing: {
      credits: "クレジット",
      creditsUnit: "クレジット",
      useCreditsDescription: "クレジットはマーケットプレイスや機能モジュールで利用します。",
      topupTitle: "クレジットを追加",
      topupDescription: "追加クレジットを購入。大きいプランほど単価が有利です。",
      oneTimePayment: "一回払い",
      save: "節約",
      preparing: "準備中...",
      purchaseNow: "今すぐ購入",
      transactionHistory: "取引履歴",
      date: "日時",
      provider: "プロバイダ",
      paymentIntent: "Payment Intent",
      amount: "金額",
      status: "ステータス",
      noTransactions: "取引履歴はまだありません。",
      purchaseCredits: "クレジット購入",
      oneTimeTopupPackage: "一回チャージプラン",
      devNotice:
        "このテンプレートでは開発用途としてアプリ内で支払い確定を行います。後で Stripe Elements + client_secret を接続できます。",
      cancel: "キャンセル",
      payNow: "支払う",
      processing: "処理中...",
      failedLoad: "請求データの読み込みに失敗しました",
      failedCreateIntent: "Payment Intent の作成に失敗しました",
      paymentSuccessful: "支払いに成功しました。",
      balance: "残高",
      paymentConfirmFailed: "支払い確認に失敗しました",
    },
    teams: {
      section: "チーム",
      title: "チーム",
      description: "チーム作成、メンバー招待、招待承認を行います。",
      createPanelTitle: "チーム作成",
      createPanelDescription: "現在のテナント配下にチームを作成します。",
      teamName: "チーム名",
      teamNamePlaceholder: "My Team",
      createTeamAction: "チーム作成",
      invitesPanelTitle: "チーム招待",
      invitesPanelDescription: "メールで招待を作成し、token で承認できます。",
      createInviteTitle: "招待作成",
      team: "チーム",
      selectTeam: "チームを選択",
      inviteEmail: "招待メール",
      inviteEmailPlaceholder: "member@example.com",
      createInviteAction: "招待作成",
      acceptInviteTitle: "招待承認",
      inviteToken: "招待トークン",
      inviteTokenPlaceholder: "招待トークンを貼り付け",
      acceptInviteAction: "招待を承認",
      myTeamsTitle: "所属チーム",
      myTeamsDescription: "現在のアカウントが所属するチーム一覧。",
      colName: "名前",
      colSlug: "Slug",
      colOwner: "オーナーユーザー ID",
      colDetail: "詳細",
      open: "開く",
      noTeamsTitle: "チームがありません",
      noTeamsDescription: "最初のチームを作成してコラボを開始してください。",
      pendingInvitesTitle: "保留中の招待",
      pendingInvitesDescription: "承認待ちの招待がここに表示されます。",
      colTeamID: "チーム ID",
      colEmail: "メール",
      colStatus: "ステータス",
      colAction: "操作",
      accept: "承認",
      noPendingInvitesTitle: "保留中の招待はありません",
      noPendingInvitesDescription: "招待されるとここに表示されます。",
      feedbackTitle: "チームフィードバック",
      failedLoadTeams: "チームの読み込みに失敗しました",
      teamCreated: "チームを作成しました",
      failedCreateTeam: "チーム作成に失敗しました",
      inviteCreated: "招待を作成しました",
      failedCreateInvite: "招待作成に失敗しました",
      inviteAccepted: "招待を承認しました",
      failedAcceptInvite: "招待承認に失敗しました",
    },
    teamDetail: {
      section: "チーム",
      title: "チーム詳細",
      unavailableTitle: "チームを表示できません",
      unavailableDescription: "チーム一覧に戻って別のチームを選択してください。",
      descriptionPrefix: "次のチームのメンバーとアクセス権を管理:",
      profileTitle: "チーム情報",
      profileDescription: "テナントスコープのチームメタデータ。",
      teamID: "チーム ID",
      slug: "Slug",
      ownerUserID: "オーナーユーザー ID",
      membersTitle: "メンバー",
      membersDescription: "現在のチームメンバー一覧。",
      colName: "名前",
      colEmail: "メール",
      colRole: "ロール",
      colJoined: "参加日時",
      colMemberAction: "操作",
      noMembersTitle: "メンバーがいません",
      noMembersDescription: "メンバーを招待してコラボを開始してください。",
      teamNameLabel: "チーム名",
      teamNamePlaceholder: "チーム名を入力",
      saveTeamAction: "チームを保存",
      savingAction: "保存中...",
      selectTeamAction: "現在のチームに設定",
      selectingTeam: "切り替え中...",
      deleteTeamAction: "チーム削除",
      deletingAction: "削除中...",
      deleteConfirmText: "このチームを完全に削除しますか？",
      invitesTitle: "保留中の招待",
      invitesDescription: "このチームへの招待を作成・管理します。",
      inviteEmailPlaceholder: "member@example.com",
      inviteAction: "メンバー招待",
      invitingAction: "招待中...",
      loadingInvites: "招待を読み込み中...",
      colInviteEmail: "メール",
      colInviteStatus: "ステータス",
      colInviteExpires: "有効期限",
      colInviteAction: "操作",
      cancelInviteAction: "取り消し",
      noInvitesDescription: "保留中の招待はありません。",
      loadingMembers: "メンバーを読み込み中...",
      removeMemberAction: "削除",
      removeOwnerDisabled: "チームオーナーは削除できません。",
      failedLoadInvites: "チーム招待の読み込みに失敗しました",
      failedLoadMembers: "チームメンバーの読み込みに失敗しました",
      validationTeamNameRequired: "チーム名は必須です。",
      validationInviteEmailRequired: "招待メールは必須です。",
      savingProfile: "チーム情報を保存中...",
      profileSaved: "チーム情報を更新しました。",
      profileSaveFailed: "チーム情報の更新に失敗しました",
      invitingMember: "招待を作成中...",
      inviteCreated: "招待を作成しました。",
      inviteCreateFailed: "招待作成に失敗しました",
      cancelingInvite: "招待を取り消し中...",
      inviteCanceled: "招待を取り消しました。",
      inviteCancelFailed: "招待取り消しに失敗しました",
      updatingRole: "ロール更新中...",
      roleUpdated: "ロールを更新しました。",
      roleUpdateFailed: "ロール更新に失敗しました",
      removingMember: "メンバーを削除中...",
      memberRemoved: "メンバーを削除しました。",
      memberRemoveFailed: "メンバー削除に失敗しました",
      teamSelected: "チームを選択しました。",
      teamSelectFailed: "チーム選択に失敗しました",
      deletingTeam: "チーム削除中...",
      teamDeleted: "チームを削除しました。",
      teamDeleteFailed: "チーム削除に失敗しました",
      rolesTitle: "カスタムロール",
      rolesDescription: "このチーム向けのカスタムロールを作成・管理します。",
      roleIDLabel: "ロール ID",
      roleIDPlaceholder: "analyst",
      roleNameLabel: "ロール名",
      roleNamePlaceholder: "アナリスト",
      roleDescriptionLabel: "ロール説明",
      roleDescriptionPlaceholder: "分析のみ閲覧可能",
      rolePermissionsLabel: "権限（カンマ区切り）",
      rolePermissionsPlaceholder: "teams.read,dashboard.read",
      createRoleAction: "ロール作成",
      updateRoleAction: "ロール更新",
      savingRoleCreate: "作成中...",
      savingRoleUpdate: "更新中...",
      cancelRoleEdit: "キャンセル",
      colRoleID: "ロール ID",
      colRoleName: "ロール",
      colRolePermissions: "権限",
      colRoleAction: "操作",
      editRoleAction: "編集",
      deleteRoleAction: "削除",
      validationRoleIDRequired: "ロール ID は必須です。",
      validationRoleNameRequired: "ロール名は必須です。",
      validationRoleReserved: "owner/member は予約済みシステムロールです。",
      creatingRole: "ロール作成中...",
      updatingRoleDefinition: "ロール更新中...",
      roleCreated: "ロールを作成しました。",
      roleDefinitionUpdated: "ロールを更新しました。",
      roleSaveFailed: "ロール保存に失敗しました",
      deletingRole: "ロール削除中...",
      roleDeleted: "ロールを削除しました。",
      roleDeleteFailed: "ロール削除に失敗しました",
      roleDeleteConfirmText: "このカスタムロールを削除しますか？",
    },
    marketplace: {
      section: "マーケットプレイス",
      title: "マーケットプレイス",
      description: "購入可能なクレジットパッケージとカタログ項目。",
      catalogTitle: "カタログ",
      catalogDescription: "カタログは /api/v1/marketplace/catalog から読み込みます。",
      colName: "名前",
      colCode: "コード",
      colType: "タイプ",
      colCredits: "クレジット",
      colStatus: "ステータス",
      colAction: "操作",
      enabled: "有効",
      disabled: "無効",
      purchase: "購入",
      noItemsTitle: "アイテムがありません",
      noItemsDescription: "バックエンドのシード後にカタログが表示されます。",
      feedbackTitle: "マーケットプレイス通知",
      failedLoad: "カタログの読み込みに失敗しました",
      purchaseCompleted: "購入が完了しました。",
      currentCredits: "現在のクレジット",
      failedPurchase: "購入に失敗しました",
    },
    sessions: {
      section: "セキュリティ",
      title: "セッション",
      description: "アクティブなログインセッションを表示・無効化します。",
      panelTitle: "アクティブセッション",
      panelDescription: "現在のアカウントのデバイス/ブラウザ別セッション。",
      refresh: "更新",
      refreshing: "更新中...",
      colSession: "セッション",
      colStatus: "ステータス",
      colExpires: "有効期限",
      colLastSeen: "最終アクセス",
      colAction: "操作",
      created: "作成日時",
      current: "現在",
      active: "有効",
      currentSession: "現在のセッション",
      revoke: "無効化",
      noSessionsTitle: "アクティブセッションがありません",
      noSessionsDescription: "サインインすると新しいセッションが作成されます。",
      feedbackTitle: "セッション通知",
      failedLoad: "セッションの読み込みに失敗しました",
      sessionRevoked: "セッションを無効化しました",
      failedRevoke: "セッションの無効化に失敗しました",
      sessionTitle: "アクティブセッション",
      deleteSessionTitle: "このセッションを削除しますか？",
      deleteSessionDescription: "この端末はサインアウトされます。この操作は取り消せません。",
      cancel: "キャンセル",
      confirmDelete: "セッション削除",
    },
    teamInvite: {
      pageTitle: "チーム招待",
      invalidLinkTitle: "無効な招待リンク",
      invalidLinkDescription: "招待リンクが無効か期限切れです。",
      goDashboard: "ダッシュボードへ",
      acceptingTitle: "招待を承認中",
      acceptingDescription: "チーム招待を処理しています。しばらくお待ちください...",
      signInRequiredTitle: "サインインが必要です",
      signInRequiredDescription: "このチーム招待を承認するにはサインインしてください。",
      signInContinue: "サインインして続行",
      createAccount: "アカウント作成",
      successTitle: "招待を承認しました",
      openTeamDashboard: "チームダッシュボードを開く",
      goToDashboard: "ダッシュボードへ",
      errorTitle: "招待エラー",
      errorDefault: "招待の処理に失敗しました。",
      alreadyMember: "すでにこのチームのメンバーです。",
      maybeExpired: "招待は期限切れまたは取り消し済みの可能性があります。",
      inviteToken: "招待トークン",
      inviteTokenPlaceholder: "招待トークンを貼り付け",
      tryAgain: "再試行",
      inviteTokenRequired: "招待トークンは必須です。",
      joinedSuccess: "チームへの参加に成功しました。",
      failedAccept: "チーム招待の承認に失敗しました",
    },
  },
};
