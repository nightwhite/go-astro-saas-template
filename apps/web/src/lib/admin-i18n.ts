import type { Locale } from "@/lib/i18n";

type AdminMessages = {
  common: {
    prev: string;
    next: string;
    loading: string;
    applyFilters: string;
    save: string;
    refresh: string;
    create: string;
    details: string;
    enabled: string;
    disabled: string;
    tenant: string;
    userID: string;
    roleBindings: string;
    effectivePermissions: string;
    description: string;
    userDetailUnavailable: string;
    returnToUserList: string;
    detailDescriptionPrefix: string;
    pageNotFoundTitle: string;
    pageNotFoundDescription: string;
  };
  sidebar: {
    adminPanel: string;
    platform: string;
    rolePrefix: string;
    items: Record<
      | "Dashboard"
      | "SEO"
      | "Users"
      | "Roles"
      | "Files"
      | "Jobs"
      | "Audit"
      | "Observability"
      | "Blog"
      | "Announcements"
      | "Site"
      | "Auth"
      | "SMTP"
      | "Email Templates"
      | "Storage"
      | "Profile",
      string
    >;
  };
  dashboard: {
    section: string;
    title: string;
    description: string;
    noOverviewTitle: string;
    noOverviewDescription: string;
    cards: {
      users: string;
      files: string;
      jobs: string;
      auditLogs: string;
      usersHint: string;
      filesHint: string;
      jobsHint: string;
      auditHint: string;
    };
    recentUsersTitle: string;
    recentUsersDescription: string;
    noUsersTitle: string;
    noUsersDescription: string;
    quickActionsTitle: string;
    quickActionsDescription: string;
    actions: {
      openUsers: string;
      manageRoles: string;
      queueJobs: string;
      smtpSettings: string;
    };
  };
  dashboardLegacy: {
    cards: {
      modules: string;
      users: string;
      files: string;
      api: string;
    };
    offline: string;
    recentActivityTitle: string;
    recentActivityDescription: string;
    recentUsersTitle: string;
    recentFilesTitle: string;
    noUserData: string;
    noFileData: string;
    systemTitle: string;
    systemDescription: string;
    environmentLabel: string;
    appLabel: string;
    modulesLabel: string;
    unknown: string;
    unavailable: string;
    saveSMTPDemo: string;
    createDemoFile: string;
    saveSMTPDemoSuccess: string;
    saveSMTPDemoFailed: string;
    createDemoFileSuccess: string;
    createDemoFileFailed: string;
    unavailableTitle: string;
    unavailableDescription: string;
  };
  users: {
    section: string;
    title: string;
    description: string;
    failedLoad: string;
    failedCreate: string;
    failedStatus: string;
    failedResetPassword: string;
    failedDelete: string;
    createdUser: string;
    statusUpdated: string;
    resetSuccess: string;
    deleted: string;
    filters: {
      email: string;
      emailPlaceholder: string;
      role: string;
      status: string;
      rolePlaceholder: string;
      statusPlaceholder: string;
    };
    createDemoUser: string;
    creating: string;
    panelTitle: string;
    panelDescription: string;
    noUsersTitle: string;
    noUsersDescription: string;
    columns: {
      user: string;
      role: string;
      status: string;
      actions: string;
    };
    actionButtons: {
      details: string;
      toggleStatus: string;
      resetPassword: string;
      delete: string;
    };
    loading: string;
    feedbackTitle: string;
    paginationPrev: string;
    paginationNext: string;
    explainPrefix: string;
  };
  roles: {
    section: string;
    title: string;
    description: string;
    failedLoad: string;
    failedUpdatePermissions: string;
    failedBindUser: string;
    permissionsUpdated: string;
    bindSuccess: string;
    filters: {
      roleKey: string;
      roleName: string;
      selectedRoleID: string;
      permissions: string;
      roleKeyPlaceholder: string;
      roleNamePlaceholder: string;
      permissionsPlaceholder: string;
    };
    savePermissions: string;
    bindPanelTitle: string;
    bindPanelDescription: string;
    userEmail: string;
    bindRole: string;
    listPanelTitle: string;
    listPanelDescription: string;
    loading: string;
    noRolesTitle: string;
    noRolesDescription: string;
    columns: {
      role: string;
      key: string;
    };
    feedbackTitle: string;
    paginationPrev: string;
    paginationNext: string;
  };
  files: {
    title: string;
    description: string;
    failedLoad: string;
    failedGenerateUploadURL: string;
    failedInspect: string;
    applyFilters: string;
    generateUploadURL: string;
    inspectFirstObject: string;
    filters: {
      fileName: string;
      contentType: string;
      fileNamePlaceholder: string;
      contentTypePlaceholder: string;
    };
    loading: string;
    noFilesTitle: string;
    noFilesDescription: string;
    columns: {
      file: string;
      type: string;
      size: string;
    };
    queryPolicyTitle: string;
    queryPolicyDescription: string;
    sortAllowlist: string;
    filterAllowlist: string;
    deletePolicy: string;
    explainPrefix: string;
    feedbackTitle: string;
  };
  jobs: {
    section: string;
    title: string;
    description: string;
    failedLoad: string;
    failedEnqueue: string;
    enqueued: string;
    createDemoJob: string;
    filters: {
      jobType: string;
      status: string;
      queue: string;
      jobTypePlaceholder: string;
      statusPlaceholder: string;
      queuePlaceholder: string;
    };
    panelTitle: string;
    panelDescription: string;
    loading: string;
    noJobsTitle: string;
    noJobsDescription: string;
    columns: {
      job: string;
      status: string;
      attempts: string;
      queueLabel: string;
    };
    explainPrefix: string;
    feedbackTitle: string;
  };
  audit: {
    section: string;
    title: string;
    description: string;
    filters: {
      actor: string;
      action: string;
      resource: string;
      actorPlaceholder: string;
      actionPlaceholder: string;
      resourcePlaceholder: string;
    };
    panelTitle: string;
    panelDescription: string;
    loading: string;
    noEventsTitle: string;
    noEventsDescription: string;
    columns: {
      action: string;
      actor: string;
      resource: string;
    };
    detailTitle: string;
    detailDescription: string;
    explainPrefix: string;
    fields: {
      id: string;
      actor: string;
      action: string;
      resource: string;
      detail: string;
      createdAt: string;
    };
    paginationPrev: string;
    paginationNext: string;
  };
  observability: {
    section: string;
    title: string;
    description: string;
    failedMetrics: string;
    overviewUnavailableTitle: string;
    overviewUnavailableDescription: string;
    metricsErrorTitle: string;
    panels: {
      healthTitle: string;
      healthDescription: string;
      queueTitle: string;
      queueDescription: string;
      resourcesTitle: string;
      resourcesDescription: string;
    };
    labels: {
      jobs: string;
      audit: string;
      queueTotal: string;
      users: string;
      files: string;
      settings: string;
      slowRequest: string;
      slowQuery: string;
      cacheHit: string;
    };
  };
  profile: {
    section: string;
    title: string;
    description: string;
    panelTitle: string;
    panelDescription: string;
    fields: {
      displayName: string;
      email: string;
      role: string;
      tenant: string;
    };
    saveButton: string;
    logoutAllButton: string;
    logoutAllSuccess: string;
    logoutAllFailed: string;
    feedbackTitle: string;
  };
  settingsSite: {
    title: string;
    description: string;
    panelTitle: string;
    panelDescription: string;
    failedLoad: string;
    failedSave: string;
    saved: string;
    fields: {
      appName: string;
      baseURL: string;
      webOrigin: string;
    };
    feedbackTitle: string;
  };
  settingsAuth: {
    title: string;
    description: string;
    panelTitle: string;
    panelDescription: string;
    failedLoad: string;
    failedSave: string;
    saved: string;
    fields: {
      defaultAdminEmail: string;
      sessionTTL: string;
      secureCookie: string;
      secureCookieHint: string;
    };
    feedbackTitle: string;
  };
  settingsSMTP: {
    title: string;
    description: string;
    panelTitle: string;
    panelDescription: string;
    failedSave: string;
    failedTest: string;
    saveSuccess: string;
    testSuccess: string;
    fields: {
      host: string;
      port: string;
      from: string;
      testRecipient: string;
      templateMailEnabled: string;
      templateMailHint: string;
    };
    saveButton: string;
    saving: string;
    testButton: string;
    testing: string;
    emailTemplates: string;
    releasePolicyTitle: string;
    releasePolicyDescription: string;
    releasePolicyBody: string;
    feedbackTitle: string;
  };
  settingsStorage: {
    title: string;
    description: string;
    panelTitle: string;
    panelDescription: string;
    failedLoad: string;
    failedSave: string;
    failedTest: string;
    saveSuccess: string;
    testSuccess: string;
    fields: {
      bucket: string;
      endpoint: string;
      publicBaseURL: string;
      presignEnabled: string;
      presignHint: string;
    };
    saveButton: string;
    saving: string;
    testButton: string;
    testing: string;
    policyTitle: string;
    policyDescription: string;
    policyBody: string;
    feedbackTitle: string;
  };
  blog: {
    createShort: string;
  };
  announcements: {
    title: string;
    description: string;
    panelTitle: string;
    panelDescription: string;
    filters: {
      keyword: string;
      keywordPlaceholder: string;
      status: string;
      statusPlaceholder: string;
    };
    columns: {
      title: string;
      status: string;
      publishedAt: string;
      actions: string;
    };
    actions: {
      publish: string;
      unpublish: string;
    };
    notPublished: string;
    emptyTitle: string;
    emptyDescription: string;
    saved: string;
    feedbackTitle: string;
  };
  emailTemplates: {
    section: string;
    title: string;
    description: string;
    failedLoadList: string;
    failedLoadSelected: string;
    failedSave: string;
    failedPreview: string;
    failedTestSend: string;
    saved: string;
    previewRendered: string;
    testSent: string;
    listTitle: string;
    listDescription: string;
    noTemplatesTitle: string;
    noTemplatesDescription: string;
    columns: {
      key: string;
      subject: string;
      status: string;
    };
    editorTitle: string;
    editorDescription: string;
    fields: {
      templateKey: string;
      description: string;
      subject: string;
      body: string;
      enabled: string;
    };
    buttons: {
      save: string;
      preview: string;
      sendTest: string;
    };
    previewTitle: string;
    feedbackTitle: string;
  };
  seo: {
    section: string;
    title: string;
    description: string;
    failedLoad: string;
    failedSave: string;
    failedInit: string;
    saved: string;
    initialized: string;
    alreadyInitialized: string;
    notInitializedTitle: string;
    notInitializedDescription: string;
    initButton: string;
    initializing: string;
    saving: string;
    sections: {
      site: string;
      siteDescription: string;
      organization: string;
      organizationDescription: string;
      social: string;
      socialDescription: string;
      robotsSitemap: string;
      robotsSitemapDescription: string;
      integrations: string;
      integrationsDescription: string;
      toggles: string;
      togglesDescription: string;
    };
    fields: {
      siteName: string;
      siteDescription: string;
      siteURL: string;
      defaultLanguage: string;
      defaultKeywords: string;
      organizationType: string;
      organizationName: string;
      organizationLogo: string;
      organizationDescription: string;
      contactEmail: string;
      socialTwitter: string;
      socialFacebook: string;
      socialLinkedIn: string;
      socialGitHub: string;
      socialYouTube: string;
      robotsAllowPaths: string;
      robotsDisallowPaths: string;
      robotsCustomRules: string;
      sitemapIncludePaths: string;
      sitemapExcludePaths: string;
      sitemapChangeFreq: string;
      sitemapPriority: string;
      googleAnalyticsID: string;
      googleVerification: string;
      bingVerification: string;
      defaultOgImage: string;
      defaultTwitterCard: string;
      enableStructuredData: string;
      enableBreadcrumbs: string;
      enableAuthorSchema: string;
    };
    feedbackTitle: string;
  };
};

const messages: Record<Locale, AdminMessages> = {
  en: {
    common: {
      prev: "Prev",
      next: "Next",
      loading: "Loading...",
      applyFilters: "Apply filters",
      save: "Save",
      refresh: "Refresh",
      create: "Create",
      details: "Details",
      enabled: "Enabled",
      disabled: "Disabled",
      tenant: "Tenant",
      userID: "User ID",
      roleBindings: "Role Bindings",
      effectivePermissions: "Effective Permissions",
      description: "Description",
      userDetailUnavailable: "User detail unavailable",
      returnToUserList: "Please return to user list and select another user.",
      detailDescriptionPrefix: "Inspect role bindings and effective permissions for",
      pageNotFoundTitle: "Page not found",
      pageNotFoundDescription: "The admin route does not exist.",
    },
    sidebar: {
      adminPanel: "Admin Panel",
      platform: "Platform",
      rolePrefix: "Role",
      items: {
        Dashboard: "Dashboard",
        SEO: "SEO",
        Blog: "Blog",
        Announcements: "Announcements",
        Users: "Users",
        Roles: "Roles",
        Files: "Files",
        Jobs: "Jobs",
        Audit: "Audit",
        Observability: "Observability",
        Site: "Site",
        Auth: "Auth",
        SMTP: "SMTP",
        "Email Templates": "Email Templates",
        Storage: "Storage",
        Profile: "Profile",
      },
    },
    dashboard: {
      section: "Dashboard",
      title: "Dashboard",
      description: "Overview cards, recent users, and quick operation shortcuts.",
      noOverviewTitle: "No overview data",
      noOverviewDescription: "Sign in as an admin role and refresh dashboard.",
      cards: {
        users: "Users",
        files: "Files",
        jobs: "Jobs",
        auditLogs: "Audit Logs",
        usersHint: "Tenant scoped users",
        filesHint: "Object metadata rows",
        jobsHint: "Queued and executed jobs",
        auditHint: "Operation records",
      },
      recentUsersTitle: "Recent users",
      recentUsersDescription: "Latest users from admin overview payload.",
      noUsersTitle: "No users",
      noUsersDescription: "Create users in admin/users.",
      quickActionsTitle: "Quick actions",
      quickActionsDescription: "Shortcut links aligned with reference template workflow.",
      actions: {
        openUsers: "Open users",
        manageRoles: "Manage roles",
        queueJobs: "Queue jobs",
        smtpSettings: "SMTP settings",
      },
    },
    dashboardLegacy: {
      cards: {
        modules: "Modules",
        users: "Users",
        files: "Files",
        api: "API",
      },
      offline: "offline",
      recentActivityTitle: "Recent activity",
      recentActivityDescription: "Users and files from admin overview API.",
      recentUsersTitle: "Recent users",
      recentFilesTitle: "Recent files",
      noUserData: "No user data available.",
      noFileData: "No file data available.",
      systemTitle: "System",
      systemDescription: "Quick actions for SMTP and file workflow demos.",
      environmentLabel: "Environment",
      appLabel: "App",
      modulesLabel: "Modules",
      unknown: "unknown",
      unavailable: "unavailable",
      saveSMTPDemo: "Save SMTP demo",
      createDemoFile: "Create demo file",
      saveSMTPDemoSuccess: "SMTP demo settings saved.",
      saveSMTPDemoFailed: "Failed to save SMTP demo settings.",
      createDemoFileSuccess: "Created demo file record.",
      createDemoFileFailed: "Failed to create demo file.",
      unavailableTitle: "Admin data unavailable",
      unavailableDescription: "Login to API and reload the admin page.",
    },
    users: {
      section: "Users",
      title: "Users",
      description: "Manage all users with tenant-scoped role and status controls.",
      failedLoad: "Failed to load users",
      failedCreate: "Failed to create user",
      failedStatus: "Failed to update user status",
      failedResetPassword: "Failed to reset password",
      failedDelete: "Failed to delete user",
      createdUser: "Created user",
      statusUpdated: "Status updated to",
      resetSuccess: "Password reset to default value member123456",
      deleted: "User deleted",
      filters: {
        email: "Email",
        emailPlaceholder: "Filter emails...",
        role: "Role",
        status: "Status",
        rolePlaceholder: "member / admin",
        statusPlaceholder: "active / inactive",
      },
      createDemoUser: "Create demo user",
      creating: "Creating...",
      panelTitle: "Users",
      panelDescription: "User list rendered from admin overview API.",
      noUsersTitle: "No users found",
      noUsersDescription: "Try adjusting the filter.",
      columns: {
        user: "User",
        role: "Role",
        status: "Status",
        actions: "Actions",
      },
      actionButtons: {
        details: "Details",
        toggleStatus: "Toggle status",
        resetPassword: "Reset password",
        delete: "Delete",
      },
      loading: "Loading users...",
      feedbackTitle: "User feedback",
      paginationPrev: "Prev",
      paginationNext: "Next",
      explainPrefix: "Explain",
    },
    roles: {
      section: "Roles",
      title: "Role Management",
      description: "Update role permissions and bind users to roles.",
      failedLoad: "Failed to load roles",
      failedUpdatePermissions: "Failed to update role permissions",
      failedBindUser: "Failed to bind user role",
      permissionsUpdated: "Role permissions updated",
      bindSuccess: "Bound user email to selected role",
      filters: {
        roleKey: "Role key",
        roleName: "Role name",
        selectedRoleID: "Selected role ID",
        permissions: "Permissions (comma separated)",
        roleKeyPlaceholder: "filter_key",
        roleNamePlaceholder: "filter_name",
        permissionsPlaceholder: "admin.roles.read,admin.roles.write",
      },
      savePermissions: "Save permissions",
      bindPanelTitle: "Bind user role",
      bindPanelDescription: "Attach a user account to selected role.",
      userEmail: "User email",
      bindRole: "Bind role",
      listPanelTitle: "Roles",
      listPanelDescription: "Default role seeds with permission assignments.",
      loading: "Loading roles...",
      noRolesTitle: "No roles found",
      noRolesDescription: "Role and permission endpoints are ready for extension.",
      columns: {
        role: "Role",
        key: "Key",
      },
      feedbackTitle: "Role feedback",
      paginationPrev: "Prev",
      paginationNext: "Next",
    },
    files: {
      title: "Files",
      description: "Manage object metadata, upload URLs, and storage inspections.",
      failedLoad: "Failed to load files",
      failedGenerateUploadURL: "Failed to generate upload URL",
      failedInspect: "Failed to inspect object",
      applyFilters: "Apply filters",
      generateUploadURL: "Generate upload URL",
      inspectFirstObject: "Inspect first object",
      filters: {
        fileName: "File name",
        contentType: "Content type",
        fileNamePlaceholder: "filter_file_name",
        contentTypePlaceholder: "filter_content_type",
      },
      loading: "Loading files...",
      noFilesTitle: "No files found",
      noFilesDescription: "Upload and object metadata flow is ready for module reuse.",
      columns: {
        file: "File",
        type: "Type",
        size: "Size",
      },
      queryPolicyTitle: "Query policy",
      queryPolicyDescription: "Tenant scope, allowlisted sorting/filtering, and explain output.",
      sortAllowlist: "Sort allowlist: `created_at` / `file_name` / `size_bytes` / `content_type`",
      filterAllowlist: "Filter allowlist: `file_name` / `content_type`",
      deletePolicy: "Delete policy: object-first delete with compensation workflow",
      explainPrefix: "Explain",
      feedbackTitle: "File feedback",
    },
    jobs: {
      section: "Jobs",
      title: "Job Queue",
      description: "Monitor queued jobs, retry status, and worker execution results.",
      failedLoad: "Failed to load jobs",
      failedEnqueue: "Failed to enqueue job",
      enqueued: "Job enqueued",
      createDemoJob: "Create demo job",
      filters: {
        jobType: "Job type",
        status: "Status",
        queue: "Queue",
        jobTypePlaceholder: "filter_job_type",
        statusPlaceholder: "filter_status",
        queuePlaceholder: "filter_queue",
      },
      panelTitle: "Jobs",
      panelDescription: "Queue records with status, retries, and failure details.",
      loading: "Loading jobs...",
      noJobsTitle: "No jobs found",
      noJobsDescription: "Queue worker pipeline is ready for module-level reuse.",
      columns: {
        job: "Job",
        status: "Status",
        attempts: "Attempts",
        queueLabel: "queue",
      },
      explainPrefix: "Explain",
      feedbackTitle: "Job feedback",
    },
    audit: {
      section: "Audit",
      title: "Audit Logs",
      description: "Track critical admin actions with actor, resource, and event details.",
      filters: {
        actor: "Actor",
        action: "Action",
        resource: "Resource",
        actorPlaceholder: "filter_actor_email",
        actionPlaceholder: "filter_action",
        resourcePlaceholder: "filter_resource",
      },
      panelTitle: "Audit events",
      panelDescription: "Default seed logs with filtering and detail drawer.",
      loading: "Loading audit logs...",
      noEventsTitle: "No audit events",
      noEventsDescription: "No matching records for current filters.",
      columns: {
        action: "Action",
        actor: "Actor",
        resource: "Resource",
      },
      detailTitle: "Audit detail",
      detailDescription: "Detailed payload for selected audit event.",
      explainPrefix: "Explain",
      fields: {
        id: "id",
        actor: "actor",
        action: "action",
        resource: "resource",
        detail: "detail",
        createdAt: "created_at",
      },
      paginationPrev: "Prev",
      paginationNext: "Next",
    },
    observability: {
      section: "Observability",
      title: "System Metrics",
      description: "Runtime health, queue depth, and application counters.",
      failedMetrics: "Failed to load metrics. Ensure API is running and session is valid.",
      overviewUnavailableTitle: "Overview unavailable",
      overviewUnavailableDescription: "Start API and login to load live runtime metrics.",
      metricsErrorTitle: "Metrics error",
      panels: {
        healthTitle: "Health",
        healthDescription: "Basic runtime health endpoints.",
        queueTitle: "Queue",
        queueDescription: "Current queue and worker state.",
        resourcesTitle: "Resources",
        resourcesDescription: "Core resource counters for admin runtime.",
      },
      labels: {
        jobs: "jobs",
        audit: "audit",
        queueTotal: "queue total",
        users: "users",
        files: "files",
        settings: "settings",
        slowRequest: "slow request",
        slowQuery: "slow query",
        cacheHit: "cache hit",
      },
    },
    profile: {
      section: "Profile",
      title: "Account Profile",
      description: "Manage profile fields and current session security actions.",
      panelTitle: "Profile",
      panelDescription: "Current account information and session controls.",
      fields: {
        displayName: "Display Name",
        email: "Email",
        role: "Role",
        tenant: "Tenant",
      },
      saveButton: "Save profile",
      logoutAllButton: "Logout all sessions",
      logoutAllSuccess: "Logged out all sessions",
      logoutAllFailed: "Failed to logout sessions",
      feedbackTitle: "Profile feedback",
    },
    settingsSite: {
      title: "Site Settings",
      description: "Application identity and trusted web origin config.",
      panelTitle: "Site",
      panelDescription: "Persist site-level settings into settings center.",
      failedLoad: "Failed to load site settings. Using defaults.",
      failedSave: "Failed to save site settings",
      saved: "Site settings saved",
      fields: {
        appName: "App Name",
        baseURL: "Base URL",
        webOrigin: "Web Origin",
      },
      feedbackTitle: "Site feedback",
    },
    settingsAuth: {
      title: "Auth Settings",
      description: "Default auth and session security policy.",
      panelTitle: "Authentication",
      panelDescription: "Edit and persist auth policy in settings center.",
      failedLoad: "Failed to load auth settings. Using defaults.",
      failedSave: "Failed to save auth settings",
      saved: "Auth settings saved",
      fields: {
        defaultAdminEmail: "Default Admin Email",
        sessionTTL: "Session TTL (seconds)",
        secureCookie: "Secure Cookie",
        secureCookieHint: "Enabled by default for production traffic.",
      },
      feedbackTitle: "Auth feedback",
    },
    settingsSMTP: {
      title: "SMTP Settings",
      description: "Mail transport config and delivery test endpoint.",
      panelTitle: "SMTP",
      panelDescription: "Configure host, port, sender identity, and mail template mode.",
      failedSave: "Failed to save SMTP settings",
      failedTest: "SMTP test failed",
      saveSuccess: "SMTP settings saved",
      testSuccess: "SMTP test succeeded",
      fields: {
        host: "Host",
        port: "Port",
        from: "From",
        testRecipient: "Test Recipient",
        templateMailEnabled: "Enable template mail",
        templateMailHint: "Use shared template pipeline for auth and system emails.",
      },
      saveButton: "Save SMTP",
      saving: "Saving...",
      testButton: "Test SMTP",
      testing: "Testing...",
      emailTemplates: "Email templates",
      releasePolicyTitle: "Release policy",
      releasePolicyDescription: "Apply SMTP changes through settings center with audit logs.",
      releasePolicyBody: "Mail logs, timeout classes, and retry strategy are available for extension.",
      feedbackTitle: "SMTP feedback",
    },
    settingsStorage: {
      title: "Storage Settings",
      description: "Object storage endpoint and presign upload policy.",
      panelTitle: "Storage",
      panelDescription: "Configure bucket, endpoint, CDN base URL, and presign mode.",
      failedLoad: "Failed to load storage settings. Using defaults.",
      failedSave: "Failed to save storage settings",
      failedTest: "Storage test failed",
      saveSuccess: "Storage settings saved",
      testSuccess: "Storage test succeeded",
      fields: {
        bucket: "Bucket",
        endpoint: "Endpoint",
        publicBaseURL: "Public Base URL",
        presignEnabled: "Enable presign upload",
        presignHint: "Metadata + presign flow for object uploads.",
      },
      saveButton: "Save Storage",
      saving: "Saving...",
      testButton: "Test Storage",
      testing: "Testing...",
      policyTitle: "Object policy",
      policyDescription: "Cleanup and compensation jobs are available in worker scheduler.",
      policyBody: "Reuse object key strategy, head/delete flow, and storage audit hooks.",
      feedbackTitle: "Storage feedback",
    },
    blog: {
      createShort: "Create",
    },
    announcements: {
      title: "Announcements",
      description: "Reusable module demo for publishing notices with standard admin components.",
      panelTitle: "Announcement list",
      panelDescription: "Demo records proving module extension can reuse shared page/layout/table primitives.",
      filters: {
        keyword: "Keyword",
        keywordPlaceholder: "Filter by title or summary",
        status: "Status",
        statusPlaceholder: "draft / published",
      },
      columns: {
        title: "Announcement",
        status: "Status",
        publishedAt: "Published At",
        actions: "Actions",
      },
      actions: {
        publish: "Publish",
        unpublish: "Unpublish",
      },
      notPublished: "Not published",
      emptyTitle: "No announcements",
      emptyDescription: "Create your first announcement module record.",
      saved: "Announcement status updated",
      feedbackTitle: "Announcement feedback",
    },
    emailTemplates: {
      section: "Settings",
      title: "Email Templates",
      description: "Manage SMTP template content, preview rendering, and test delivery.",
      failedLoadList: "Failed to load mail templates",
      failedLoadSelected: "Failed to load selected template",
      failedSave: "Failed to save template",
      failedPreview: "Failed to render preview",
      failedTestSend: "Failed to send test email",
      saved: "Template saved",
      previewRendered: "Preview rendered",
      testSent: "Test email sent",
      listTitle: "Template list",
      listDescription: "Built-in template keys mapped from auth/team flows.",
      noTemplatesTitle: "No templates",
      noTemplatesDescription: "Template registry is empty.",
      columns: {
        key: "Key",
        subject: "Subject",
        status: "Status",
      },
      editorTitle: "Template editor",
      editorDescription: "Update subject/body and validate preview render output.",
      fields: {
        templateKey: "Template key",
        description: "Description",
        subject: "Subject",
        body: "Body",
        enabled: "Enabled",
      },
      buttons: {
        save: "Save",
        preview: "Preview",
        sendTest: "Send test",
      },
      previewTitle: "Preview",
      feedbackTitle: "Email template feedback",
    },
    seo: {
      section: "Settings",
      title: "SEO",
      description: "Manage SEO defaults, social metadata, and robots/sitemap behavior.",
      failedLoad: "Failed to load SEO settings",
      failedSave: "Failed to save SEO settings",
      failedInit: "Failed to initialize SEO settings",
      saved: "SEO settings saved",
      initialized: "SEO settings initialized",
      alreadyInitialized: "SEO settings already initialized",
      notInitializedTitle: "SEO is not initialized",
      notInitializedDescription: "Initialize SEO defaults to start editing metadata.",
      initButton: "Initialize SEO",
      initializing: "Initializing...",
      saving: "Saving...",
      sections: {
        site: "Site",
        siteDescription: "Canonical site identity and language defaults.",
        organization: "Organization",
        organizationDescription: "Structured data identity and contact fields.",
        social: "Social links",
        socialDescription: "Brand profile URLs used for social metadata.",
        robotsSitemap: "Robots & sitemap",
        robotsSitemapDescription: "Allow/disallow paths and sitemap generation policy.",
        integrations: "Integrations",
        integrationsDescription: "Search engine verification and analytics IDs.",
        toggles: "Schema toggles",
        togglesDescription: "Structured data and breadcrumb rendering switches.",
      },
      fields: {
        siteName: "Site Name",
        siteDescription: "Site Description",
        siteURL: "Site URL",
        defaultLanguage: "Default Language",
        defaultKeywords: "Default Keywords",
        organizationType: "Organization Type",
        organizationName: "Organization Name",
        organizationLogo: "Organization Logo URL",
        organizationDescription: "Organization Description",
        contactEmail: "Contact Email",
        socialTwitter: "Twitter URL",
        socialFacebook: "Facebook URL",
        socialLinkedIn: "LinkedIn URL",
        socialGitHub: "GitHub URL",
        socialYouTube: "YouTube URL",
        robotsAllowPaths: "Robots Allow Paths (one per line)",
        robotsDisallowPaths: "Robots Disallow Paths (one per line)",
        robotsCustomRules: "Robots Custom Rules",
        sitemapIncludePaths: "Sitemap Include Paths (one per line)",
        sitemapExcludePaths: "Sitemap Exclude Paths (one per line)",
        sitemapChangeFreq: "Sitemap Change Frequency",
        sitemapPriority: "Sitemap Priority",
        googleAnalyticsID: "Google Analytics ID",
        googleVerification: "Google Site Verification",
        bingVerification: "Bing Site Verification",
        defaultOgImage: "Default OG Image URL",
        defaultTwitterCard: "Default Twitter Card",
        enableStructuredData: "Enable Structured Data",
        enableBreadcrumbs: "Enable Breadcrumbs",
        enableAuthorSchema: "Enable Author Schema",
      },
      feedbackTitle: "SEO feedback",
    },
  },
  zh: {
    ...(({} as unknown) as AdminMessages),
    common: {
      prev: "上一页",
      next: "下一页",
      loading: "加载中...",
      applyFilters: "应用筛选",
      save: "保存",
      refresh: "刷新",
      create: "创建",
      details: "详情",
      enabled: "启用",
      disabled: "禁用",
      tenant: "租户",
      userID: "用户ID",
      roleBindings: "角色绑定",
      effectivePermissions: "有效权限",
      description: "描述",
      userDetailUnavailable: "用户详情不可用",
      returnToUserList: "请返回用户列表并选择其他用户。",
      detailDescriptionPrefix: "查看以下用户的角色绑定与生效权限：",
      pageNotFoundTitle: "页面不存在",
      pageNotFoundDescription: "当前管理后台路由不存在。",
    },
    sidebar: {
      adminPanel: "管理面板",
      platform: "平台",
      rolePrefix: "角色",
      items: {
        Dashboard: "概览",
        SEO: "SEO",
        Blog: "博客",
        Announcements: "公告",
        Users: "用户",
        Roles: "角色",
        Files: "文件",
        Jobs: "任务",
        Audit: "审计",
        Observability: "可观测",
        Site: "站点",
        Auth: "认证",
        SMTP: "SMTP",
        "Email Templates": "邮件模板",
        Storage: "存储",
        Profile: "资料",
      },
    },
    dashboard: {
      section: "概览",
      title: "概览",
      description: "总览卡片、近期用户与常用快捷操作。",
      noOverviewTitle: "暂无概览数据",
      noOverviewDescription: "请使用管理员角色登录后刷新页面。",
      cards: {
        users: "用户",
        files: "文件",
        jobs: "任务",
        auditLogs: "审计日志",
        usersHint: "租户范围用户数",
        filesHint: "对象元数据行数",
        jobsHint: "队列与执行任务数",
        auditHint: "操作记录数",
      },
      recentUsersTitle: "近期用户",
      recentUsersDescription: "来自管理概览接口的最新用户。",
      noUsersTitle: "暂无用户",
      noUsersDescription: "可在 admin/users 创建用户。",
      quickActionsTitle: "快捷操作",
      quickActionsDescription: "与参考模板一致的常用入口。",
      actions: {
        openUsers: "打开用户列表",
        manageRoles: "管理角色",
        queueJobs: "队列任务",
        smtpSettings: "SMTP 设置",
      },
    },
    dashboardLegacy: {
      cards: {
        modules: "模块",
        users: "用户",
        files: "文件",
        api: "API",
      },
      offline: "离线",
      recentActivityTitle: "近期活动",
      recentActivityDescription: "来自管理概览接口的用户与文件数据。",
      recentUsersTitle: "近期用户",
      recentFilesTitle: "近期文件",
      noUserData: "暂无用户数据。",
      noFileData: "暂无文件数据。",
      systemTitle: "系统",
      systemDescription: "SMTP 与文件流程的快捷操作。",
      environmentLabel: "环境",
      appLabel: "应用",
      modulesLabel: "模块",
      unknown: "未知",
      unavailable: "不可用",
      saveSMTPDemo: "保存 SMTP 演示配置",
      createDemoFile: "创建演示文件",
      saveSMTPDemoSuccess: "SMTP 演示配置已保存。",
      saveSMTPDemoFailed: "保存 SMTP 演示配置失败。",
      createDemoFileSuccess: "已创建演示文件记录。",
      createDemoFileFailed: "创建演示文件失败。",
      unavailableTitle: "后台数据不可用",
      unavailableDescription: "请先登录 API 后刷新后台页面。",
    },
    users: {
      section: "用户",
      title: "用户",
      description: "按租户范围管理用户角色与状态。",
      failedLoad: "加载用户失败",
      failedCreate: "创建用户失败",
      failedStatus: "更新用户状态失败",
      failedResetPassword: "重置密码失败",
      failedDelete: "删除用户失败",
      createdUser: "已创建用户",
      statusUpdated: "状态已更新为",
      resetSuccess: "密码已重置为默认值 member123456",
      deleted: "用户已删除",
      filters: {
        email: "邮箱",
        emailPlaceholder: "按邮箱筛选...",
        role: "角色",
        status: "状态",
        rolePlaceholder: "member / admin",
        statusPlaceholder: "active / inactive",
      },
      createDemoUser: "创建演示用户",
      creating: "创建中...",
      panelTitle: "用户列表",
      panelDescription: "来自管理概览接口的用户数据。",
      noUsersTitle: "未找到用户",
      noUsersDescription: "请调整筛选条件后重试。",
      columns: {
        user: "用户",
        role: "角色",
        status: "状态",
        actions: "操作",
      },
      actionButtons: {
        details: "详情",
        toggleStatus: "切换状态",
        resetPassword: "重置密码",
        delete: "删除",
      },
      loading: "用户加载中...",
      feedbackTitle: "用户反馈",
      paginationPrev: "上一页",
      paginationNext: "下一页",
      explainPrefix: "Explain",
    },
    roles: {
      section: "角色",
      title: "角色管理",
      description: "更新角色权限并绑定用户角色。",
      failedLoad: "加载角色失败",
      failedUpdatePermissions: "更新角色权限失败",
      failedBindUser: "绑定用户角色失败",
      permissionsUpdated: "角色权限已更新",
      bindSuccess: "已将用户邮箱绑定到所选角色",
      filters: {
        roleKey: "角色键",
        roleName: "角色名称",
        selectedRoleID: "当前角色 ID",
        permissions: "权限（逗号分隔）",
        roleKeyPlaceholder: "filter_key",
        roleNamePlaceholder: "filter_name",
        permissionsPlaceholder: "admin.roles.read,admin.roles.write",
      },
      savePermissions: "保存权限",
      bindPanelTitle: "绑定用户角色",
      bindPanelDescription: "将用户账号绑定到当前角色。",
      userEmail: "用户邮箱",
      bindRole: "绑定角色",
      listPanelTitle: "角色列表",
      listPanelDescription: "默认角色种子及其权限分配。",
      loading: "角色加载中...",
      noRolesTitle: "未找到角色",
      noRolesDescription: "角色与权限接口已就绪，可继续扩展。",
      columns: {
        role: "角色",
        key: "键",
      },
      feedbackTitle: "角色反馈",
      paginationPrev: "上一页",
      paginationNext: "下一页",
    },
    files: {
      title: "文件",
      description: "管理对象元数据、上传 URL 与存储检查。",
      failedLoad: "加载文件失败",
      failedGenerateUploadURL: "生成上传 URL 失败",
      failedInspect: "检查对象失败",
      applyFilters: "应用筛选",
      generateUploadURL: "生成上传 URL",
      inspectFirstObject: "检查首个对象",
      filters: {
        fileName: "文件名",
        contentType: "内容类型",
        fileNamePlaceholder: "filter_file_name",
        contentTypePlaceholder: "filter_content_type",
      },
      loading: "文件加载中...",
      noFilesTitle: "未找到文件",
      noFilesDescription: "上传与对象元数据流程已可复用。",
      columns: {
        file: "文件",
        type: "类型",
        size: "大小",
      },
      queryPolicyTitle: "查询策略",
      queryPolicyDescription: "租户范围、白名单排序/筛选与 explain 输出。",
      sortAllowlist: "排序白名单：`created_at` / `file_name` / `size_bytes` / `content_type`",
      filterAllowlist: "筛选白名单：`file_name` / `content_type`",
      deletePolicy: "删除策略：先删对象，再做补偿流程。",
      explainPrefix: "执行计划",
      feedbackTitle: "文件反馈",
    },
    jobs: {
      section: "任务",
      title: "任务队列",
      description: "监控队列任务、重试状态和执行结果。",
      failedLoad: "加载任务失败",
      failedEnqueue: "入队任务失败",
      enqueued: "任务已入队",
      createDemoJob: "创建演示任务",
      filters: {
        jobType: "任务类型",
        status: "状态",
        queue: "队列",
        jobTypePlaceholder: "filter_job_type",
        statusPlaceholder: "filter_status",
        queuePlaceholder: "filter_queue",
      },
      panelTitle: "任务列表",
      panelDescription: "队列记录、重试次数与失败详情。",
      loading: "任务加载中...",
      noJobsTitle: "未找到任务",
      noJobsDescription: "队列工作流模块可继续复用扩展。",
      columns: {
        job: "任务",
        status: "状态",
        attempts: "重试次数",
        queueLabel: "队列",
      },
      explainPrefix: "执行计划",
      feedbackTitle: "任务反馈",
    },
    audit: {
      section: "审计",
      title: "审计日志",
      description: "跟踪关键管理动作与资源事件。",
      filters: {
        actor: "操作者",
        action: "动作",
        resource: "资源",
        actorPlaceholder: "filter_actor_email",
        actionPlaceholder: "filter_action",
        resourcePlaceholder: "filter_resource",
      },
      panelTitle: "审计事件",
      panelDescription: "默认审计数据支持筛选和详情抽屉。",
      loading: "审计日志加载中...",
      noEventsTitle: "暂无审计事件",
      noEventsDescription: "当前筛选条件下没有匹配记录。",
      columns: {
        action: "动作",
        actor: "操作者",
        resource: "资源",
      },
      detailTitle: "审计详情",
      detailDescription: "当前审计事件的详细载荷。",
      explainPrefix: "执行计划",
      fields: {
        id: "id",
        actor: "操作者",
        action: "动作",
        resource: "资源",
        detail: "详情",
        createdAt: "创建时间",
      },
      paginationPrev: "上一页",
      paginationNext: "下一页",
    },
    observability: {
      section: "可观测",
      title: "系统指标",
      description: "运行健康、队列积压与应用计数指标。",
      failedMetrics: "加载指标失败，请确认 API 已启动且会话有效。",
      overviewUnavailableTitle: "概览不可用",
      overviewUnavailableDescription: "请先启动 API 并登录以加载实时指标。",
      metricsErrorTitle: "指标错误",
      panels: {
        healthTitle: "健康检查",
        healthDescription: "基础健康检查端点。",
        queueTitle: "队列",
        queueDescription: "当前队列与 Worker 状态。",
        resourcesTitle: "资源",
        resourcesDescription: "管理后台核心资源计数。",
      },
      labels: {
        jobs: "任务",
        audit: "审计",
        queueTotal: "队列总量",
        users: "用户",
        files: "文件",
        settings: "配置",
        slowRequest: "慢请求",
        slowQuery: "慢查询",
        cacheHit: "缓存命中率",
      },
    },
    profile: {
      section: "资料",
      title: "账户资料",
      description: "管理资料字段与当前会话安全操作。",
      panelTitle: "资料",
      panelDescription: "当前账户信息与会话控制。",
      fields: {
        displayName: "显示名称",
        email: "邮箱",
        role: "角色",
        tenant: "租户",
      },
      saveButton: "保存资料",
      logoutAllButton: "退出所有会话",
      logoutAllSuccess: "已退出所有会话",
      logoutAllFailed: "退出所有会话失败",
      feedbackTitle: "资料反馈",
    },
    settingsSite: {
      title: "站点设置",
      description: "应用标识与受信任 Web 源配置。",
      panelTitle: "站点",
      panelDescription: "将站点级配置持久化到设置中心。",
      failedLoad: "加载站点设置失败，已使用默认值。",
      failedSave: "保存站点设置失败",
      saved: "站点设置已保存",
      fields: {
        appName: "应用名称",
        baseURL: "服务基础 URL",
        webOrigin: "Web 来源",
      },
      feedbackTitle: "站点反馈",
    },
    settingsAuth: {
      title: "认证设置",
      description: "默认认证与会话安全策略。",
      panelTitle: "认证",
      panelDescription: "编辑并保存认证策略配置。",
      failedLoad: "加载认证设置失败，已使用默认值。",
      failedSave: "保存认证设置失败",
      saved: "认证设置已保存",
      fields: {
        defaultAdminEmail: "默认管理员邮箱",
        sessionTTL: "会话 TTL（秒）",
        secureCookie: "安全 Cookie",
        secureCookieHint: "生产环境默认建议启用。",
      },
      feedbackTitle: "认证反馈",
    },
    settingsSMTP: {
      title: "SMTP 设置",
      description: "邮件传输配置与发送测试端点。",
      panelTitle: "SMTP",
      panelDescription: "配置主机、端口、发件人及模板邮件模式。",
      failedSave: "保存 SMTP 设置失败",
      failedTest: "SMTP 测试失败",
      saveSuccess: "SMTP 设置已保存",
      testSuccess: "SMTP 测试成功",
      fields: {
        host: "主机",
        port: "端口",
        from: "发件地址",
        testRecipient: "测试收件人",
        templateMailEnabled: "启用模板邮件",
        templateMailHint: "统一用于认证和系统邮件模板通道。",
      },
      saveButton: "保存 SMTP",
      saving: "保存中...",
      testButton: "测试 SMTP",
      testing: "测试中...",
      emailTemplates: "邮件模板",
      releasePolicyTitle: "发布策略",
      releasePolicyDescription: "通过设置中心与审计日志发布 SMTP 变更。",
      releasePolicyBody: "可继续扩展邮件日志、超时分级与重试策略。",
      feedbackTitle: "SMTP 反馈",
    },
    settingsStorage: {
      title: "存储设置",
      description: "对象存储端点与预签名上传策略。",
      panelTitle: "存储",
      panelDescription: "配置桶、端点、CDN 基础地址与预签名模式。",
      failedLoad: "加载存储设置失败，已使用默认值。",
      failedSave: "保存存储设置失败",
      failedTest: "存储测试失败",
      saveSuccess: "存储设置已保存",
      testSuccess: "存储测试成功",
      fields: {
        bucket: "桶",
        endpoint: "端点",
        publicBaseURL: "公共基础 URL",
        presignEnabled: "启用预签名上传",
        presignHint: "用于对象上传的元数据 + 预签名流程。",
      },
      saveButton: "保存存储配置",
      saving: "保存中...",
      testButton: "测试存储",
      testing: "测试中...",
      policyTitle: "对象策略",
      policyDescription: "清理与补偿任务可由 Worker 调度扩展。",
      policyBody: "可复用对象键策略、head/delete 流程与审计钩子。",
      feedbackTitle: "存储反馈",
    },
    blog: {
      createShort: "创建",
    },
    announcements: {
      title: "公告",
      description: "用于验证模板可复用扩展能力的公告模块示例。",
      panelTitle: "公告列表",
      panelDescription: "示例数据用于证明新模块可复用共享页面/布局/表格组件。",
      filters: {
        keyword: "关键词",
        keywordPlaceholder: "按标题或摘要筛选",
        status: "状态",
        statusPlaceholder: "draft / published",
      },
      columns: {
        title: "公告",
        status: "状态",
        publishedAt: "发布时间",
        actions: "操作",
      },
      actions: {
        publish: "发布",
        unpublish: "取消发布",
      },
      notPublished: "未发布",
      emptyTitle: "暂无公告",
      emptyDescription: "请创建第一条公告记录。",
      saved: "公告状态已更新",
      feedbackTitle: "公告反馈",
    },
    emailTemplates: {
      section: "设置",
      title: "邮件模板",
      description: "管理 SMTP 模板内容、预览渲染与测试发送。",
      failedLoadList: "加载邮件模板列表失败",
      failedLoadSelected: "加载当前模板失败",
      failedSave: "保存模板失败",
      failedPreview: "渲染预览失败",
      failedTestSend: "测试发送失败",
      saved: "模板已保存",
      previewRendered: "预览已生成",
      testSent: "测试邮件已发送",
      listTitle: "模板列表",
      listDescription: "内置模板键映射认证与团队流程。",
      noTemplatesTitle: "暂无模板",
      noTemplatesDescription: "模板注册表为空。",
      columns: {
        key: "键",
        subject: "主题",
        status: "状态",
      },
      editorTitle: "模板编辑器",
      editorDescription: "更新主题/正文并验证渲染预览输出。",
      fields: {
        templateKey: "模板键",
        description: "说明",
        subject: "主题",
        body: "正文",
        enabled: "启用",
      },
      buttons: {
        save: "保存",
        preview: "预览",
        sendTest: "发送测试",
      },
      previewTitle: "预览",
      feedbackTitle: "邮件模板反馈",
    },
    seo: {
      section: "设置",
      title: "SEO",
      description: "管理 SEO 默认项、社交元数据以及 robots/sitemap 行为。",
      failedLoad: "加载 SEO 设置失败",
      failedSave: "保存 SEO 设置失败",
      failedInit: "初始化 SEO 设置失败",
      saved: "SEO 设置已保存",
      initialized: "SEO 设置已初始化",
      alreadyInitialized: "SEO 设置已初始化，无需重复操作",
      notInitializedTitle: "SEO 尚未初始化",
      notInitializedDescription: "请先初始化默认 SEO 配置，再进行编辑。",
      initButton: "初始化 SEO",
      initializing: "初始化中...",
      saving: "保存中...",
      sections: {
        site: "站点",
        siteDescription: "站点标识、URL 与默认语言配置。",
        organization: "组织信息",
        organizationDescription: "结构化数据组织身份与联系字段。",
        social: "社交链接",
        socialDescription: "用于社交元信息的品牌主页链接。",
        robotsSitemap: "Robots 与 Sitemap",
        robotsSitemapDescription: "允许/禁止路径与 sitemap 生成策略。",
        integrations: "集成",
        integrationsDescription: "搜索引擎验证与分析工具标识。",
        toggles: "Schema 开关",
        togglesDescription: "结构化数据与面包屑渲染开关。",
      },
      fields: {
        siteName: "站点名称",
        siteDescription: "站点描述",
        siteURL: "站点 URL",
        defaultLanguage: "默认语言",
        defaultKeywords: "默认关键词",
        organizationType: "组织类型",
        organizationName: "组织名称",
        organizationLogo: "组织 Logo URL",
        organizationDescription: "组织描述",
        contactEmail: "联系邮箱",
        socialTwitter: "Twitter 链接",
        socialFacebook: "Facebook 链接",
        socialLinkedIn: "LinkedIn 链接",
        socialGitHub: "GitHub 链接",
        socialYouTube: "YouTube 链接",
        robotsAllowPaths: "Robots 允许路径（每行一个）",
        robotsDisallowPaths: "Robots 禁止路径（每行一个）",
        robotsCustomRules: "Robots 自定义规则",
        sitemapIncludePaths: "Sitemap 包含路径（每行一个）",
        sitemapExcludePaths: "Sitemap 排除路径（每行一个）",
        sitemapChangeFreq: "Sitemap 更新频率",
        sitemapPriority: "Sitemap 优先级",
        googleAnalyticsID: "Google Analytics ID",
        googleVerification: "Google 站点验证",
        bingVerification: "Bing 站点验证",
        defaultOgImage: "默认 OG 图片 URL",
        defaultTwitterCard: "默认 Twitter Card",
        enableStructuredData: "启用结构化数据",
        enableBreadcrumbs: "启用面包屑",
        enableAuthorSchema: "启用作者 Schema",
      },
      feedbackTitle: "SEO 反馈",
    },
  },
  ja: {
    ...(({} as unknown) as AdminMessages),
    common: {
      prev: "前へ",
      next: "次へ",
      loading: "読み込み中...",
      applyFilters: "フィルター適用",
      save: "保存",
      refresh: "更新",
      create: "作成",
      details: "詳細",
      enabled: "有効",
      disabled: "無効",
      tenant: "テナント",
      userID: "ユーザーID",
      roleBindings: "ロール割当",
      effectivePermissions: "有効な権限",
      description: "説明",
      userDetailUnavailable: "ユーザー詳細を表示できません",
      returnToUserList: "ユーザー一覧に戻って別のユーザーを選択してください。",
      detailDescriptionPrefix: "次のユーザーのロール割当と有効権限を確認します：",
      pageNotFoundTitle: "ページが見つかりません",
      pageNotFoundDescription: "この管理ルートは存在しません。",
    },
    sidebar: {
      adminPanel: "管理パネル",
      platform: "プラットフォーム",
      rolePrefix: "ロール",
      items: {
        Dashboard: "ダッシュボード",
        SEO: "SEO",
        Blog: "ブログ",
        Announcements: "お知らせ",
        Users: "ユーザー",
        Roles: "ロール",
        Files: "ファイル",
        Jobs: "ジョブ",
        Audit: "監査",
        Observability: "可観測性",
        Site: "サイト",
        Auth: "認証",
        SMTP: "SMTP",
        "Email Templates": "メールテンプレート",
        Storage: "ストレージ",
        Profile: "プロフィール",
      },
    },
    dashboard: {
      section: "ダッシュボード",
      title: "ダッシュボード",
      description: "概要カード、最近のユーザー、クイックアクション。",
      noOverviewTitle: "概要データがありません",
      noOverviewDescription: "管理者ロールでサインインして更新してください。",
      cards: {
        users: "ユーザー",
        files: "ファイル",
        jobs: "ジョブ",
        auditLogs: "監査ログ",
        usersHint: "テナント内ユーザー数",
        filesHint: "オブジェクトメタデータ行数",
        jobsHint: "キュー済み・実行済みジョブ",
        auditHint: "操作記録数",
      },
      recentUsersTitle: "最近のユーザー",
      recentUsersDescription: "管理概要 API から取得した最新ユーザー。",
      noUsersTitle: "ユーザーがいません",
      noUsersDescription: "admin/users でユーザーを作成してください。",
      quickActionsTitle: "クイックアクション",
      quickActionsDescription: "参照テンプレートに合わせたショートカット。",
      actions: {
        openUsers: "ユーザー一覧を開く",
        manageRoles: "ロール管理",
        queueJobs: "ジョブキュー",
        smtpSettings: "SMTP 設定",
      },
    },
    dashboardLegacy: {
      cards: {
        modules: "モジュール",
        users: "ユーザー",
        files: "ファイル",
        api: "API",
      },
      offline: "オフライン",
      recentActivityTitle: "最近のアクティビティ",
      recentActivityDescription: "管理概要 API のユーザーとファイル一覧です。",
      recentUsersTitle: "最近のユーザー",
      recentFilesTitle: "最近のファイル",
      noUserData: "ユーザーデータがありません。",
      noFileData: "ファイルデータがありません。",
      systemTitle: "システム",
      systemDescription: "SMTP とファイルワークフローのクイック操作。",
      environmentLabel: "環境",
      appLabel: "アプリ",
      modulesLabel: "モジュール",
      unknown: "不明",
      unavailable: "利用不可",
      saveSMTPDemo: "SMTP デモ設定を保存",
      createDemoFile: "デモファイルを作成",
      saveSMTPDemoSuccess: "SMTP デモ設定を保存しました。",
      saveSMTPDemoFailed: "SMTP デモ設定の保存に失敗しました。",
      createDemoFileSuccess: "デモファイルレコードを作成しました。",
      createDemoFileFailed: "デモファイルレコードの作成に失敗しました。",
      unavailableTitle: "管理データを取得できません",
      unavailableDescription: "API にログインして管理ページを再読み込みしてください。",
    },
    users: {
      section: "ユーザー",
      title: "ユーザー",
      description: "テナント範囲でユーザーのロールと状態を管理します。",
      failedLoad: "ユーザーの読み込みに失敗しました",
      failedCreate: "ユーザー作成に失敗しました",
      failedStatus: "ユーザー状態の更新に失敗しました",
      failedResetPassword: "パスワードリセットに失敗しました",
      failedDelete: "ユーザー削除に失敗しました",
      createdUser: "ユーザーを作成しました",
      statusUpdated: "ステータスを更新しました",
      resetSuccess: "パスワードを既定値 member123456 にリセットしました",
      deleted: "ユーザーを削除しました",
      filters: {
        email: "メール",
        emailPlaceholder: "メールで絞り込み...",
        role: "ロール",
        status: "ステータス",
        rolePlaceholder: "member / admin",
        statusPlaceholder: "active / inactive",
      },
      createDemoUser: "デモユーザー作成",
      creating: "作成中...",
      panelTitle: "ユーザー一覧",
      panelDescription: "管理概要 API からのユーザーデータ。",
      noUsersTitle: "ユーザーが見つかりません",
      noUsersDescription: "フィルター条件を調整してください。",
      columns: {
        user: "ユーザー",
        role: "ロール",
        status: "ステータス",
        actions: "操作",
      },
      actionButtons: {
        details: "詳細",
        toggleStatus: "状態切替",
        resetPassword: "パスワードリセット",
        delete: "削除",
      },
      loading: "ユーザーを読み込み中...",
      feedbackTitle: "ユーザーフィードバック",
      paginationPrev: "前へ",
      paginationNext: "次へ",
      explainPrefix: "Explain",
    },
    roles: {
      section: "ロール",
      title: "ロール管理",
      description: "ロール権限の更新とユーザーへのロール割り当て。",
      failedLoad: "ロールの読み込みに失敗しました",
      failedUpdatePermissions: "ロール権限の更新に失敗しました",
      failedBindUser: "ユーザーロールの割り当てに失敗しました",
      permissionsUpdated: "ロール権限を更新しました",
      bindSuccess: "ユーザーを選択ロールに割り当てました",
      filters: {
        roleKey: "ロールキー",
        roleName: "ロール名",
        selectedRoleID: "選択ロール ID",
        permissions: "権限（カンマ区切り）",
        roleKeyPlaceholder: "filter_key",
        roleNamePlaceholder: "filter_name",
        permissionsPlaceholder: "admin.roles.read,admin.roles.write",
      },
      savePermissions: "権限を保存",
      bindPanelTitle: "ユーザーロール割り当て",
      bindPanelDescription: "ユーザーアカウントを選択ロールに関連付けます。",
      userEmail: "ユーザーメール",
      bindRole: "ロール割り当て",
      listPanelTitle: "ロール一覧",
      listPanelDescription: "既定ロールシードと権限割り当て。",
      loading: "ロールを読み込み中...",
      noRolesTitle: "ロールがありません",
      noRolesDescription: "ロール/権限 API は拡張可能です。",
      columns: {
        role: "ロール",
        key: "キー",
      },
      feedbackTitle: "ロールフィードバック",
      paginationPrev: "前へ",
      paginationNext: "次へ",
    },
    files: {
      title: "ファイル",
      description: "オブジェクトメタデータ、アップロード URL、ストレージ検査を管理します。",
      failedLoad: "ファイルの読み込みに失敗しました",
      failedGenerateUploadURL: "アップロード URL 生成に失敗しました",
      failedInspect: "オブジェクト検査に失敗しました",
      applyFilters: "フィルター適用",
      generateUploadURL: "アップロード URL 生成",
      inspectFirstObject: "先頭オブジェクトを検査",
      filters: {
        fileName: "ファイル名",
        contentType: "コンテンツタイプ",
        fileNamePlaceholder: "filter_file_name",
        contentTypePlaceholder: "filter_content_type",
      },
      loading: "ファイルを読み込み中...",
      noFilesTitle: "ファイルが見つかりません",
      noFilesDescription: "アップロード/メタデータの流れは再利用可能です。",
      columns: {
        file: "ファイル",
        type: "タイプ",
        size: "サイズ",
      },
      queryPolicyTitle: "クエリポリシー",
      queryPolicyDescription: "テナントスコープ、許可済みソート/フィルター、explain 出力。",
      sortAllowlist: "ソート許可: `created_at` / `file_name` / `size_bytes` / `content_type`",
      filterAllowlist: "フィルター許可: `file_name` / `content_type`",
      deletePolicy: "削除方針: 先にオブジェクト削除、補償フローで整合性維持。",
      explainPrefix: "Explain",
      feedbackTitle: "ファイルフィードバック",
    },
    jobs: {
      section: "ジョブ",
      title: "ジョブキュー",
      description: "キュージョブ、リトライ状態、実行結果を監視します。",
      failedLoad: "ジョブの読み込みに失敗しました",
      failedEnqueue: "ジョブ投入に失敗しました",
      enqueued: "ジョブを投入しました",
      createDemoJob: "デモジョブ作成",
      filters: {
        jobType: "ジョブタイプ",
        status: "ステータス",
        queue: "キュー",
        jobTypePlaceholder: "filter_job_type",
        statusPlaceholder: "filter_status",
        queuePlaceholder: "filter_queue",
      },
      panelTitle: "ジョブ一覧",
      panelDescription: "キューレコード、リトライ回数、失敗詳細。",
      loading: "ジョブを読み込み中...",
      noJobsTitle: "ジョブが見つかりません",
      noJobsDescription: "キューワーカーの流れはモジュール再利用可能です。",
      columns: {
        job: "ジョブ",
        status: "ステータス",
        attempts: "試行回数",
        queueLabel: "queue",
      },
      explainPrefix: "Explain",
      feedbackTitle: "ジョブフィードバック",
    },
    audit: {
      section: "監査",
      title: "監査ログ",
      description: "重要な管理操作をアクター/リソース単位で追跡します。",
      filters: {
        actor: "実行者",
        action: "操作",
        resource: "リソース",
        actorPlaceholder: "filter_actor_email",
        actionPlaceholder: "filter_action",
        resourcePlaceholder: "filter_resource",
      },
      panelTitle: "監査イベント",
      panelDescription: "フィルターと詳細ドロワー付き監査イベント。",
      loading: "監査ログを読み込み中...",
      noEventsTitle: "監査イベントがありません",
      noEventsDescription: "現在の条件に一致する記録はありません。",
      columns: {
        action: "操作",
        actor: "実行者",
        resource: "リソース",
      },
      detailTitle: "監査詳細",
      detailDescription: "選択した監査イベントの詳細データ。",
      explainPrefix: "Explain",
      fields: {
        id: "id",
        actor: "actor",
        action: "action",
        resource: "resource",
        detail: "detail",
        createdAt: "created_at",
      },
      paginationPrev: "前へ",
      paginationNext: "次へ",
    },
    observability: {
      section: "可観測性",
      title: "システムメトリクス",
      description: "ランタイム健全性、キュー深度、アプリ計数。",
      failedMetrics: "メトリクスの読み込みに失敗しました。API 起動とセッション状態を確認してください。",
      overviewUnavailableTitle: "概要を取得できません",
      overviewUnavailableDescription: "API を起動してログイン後、再読み込みしてください。",
      metricsErrorTitle: "メトリクスエラー",
      panels: {
        healthTitle: "ヘルス",
        healthDescription: "基本ヘルスエンドポイント。",
        queueTitle: "キュー",
        queueDescription: "現在のキューとワーカー状態。",
        resourcesTitle: "リソース",
        resourcesDescription: "管理ランタイムの主要リソース計数。",
      },
      labels: {
        jobs: "jobs",
        audit: "audit",
        queueTotal: "queue total",
        users: "users",
        files: "files",
        settings: "settings",
        slowRequest: "slow request",
        slowQuery: "slow query",
        cacheHit: "cache hit",
      },
    },
    profile: {
      section: "プロフィール",
      title: "アカウントプロフィール",
      description: "プロフィール項目と現在のセッションセキュリティ操作を管理します。",
      panelTitle: "プロフィール",
      panelDescription: "現在のアカウント情報とセッション制御。",
      fields: {
        displayName: "表示名",
        email: "メール",
        role: "ロール",
        tenant: "テナント",
      },
      saveButton: "プロフィール保存",
      logoutAllButton: "すべてのセッションをログアウト",
      logoutAllSuccess: "すべてのセッションをログアウトしました",
      logoutAllFailed: "セッションの一括ログアウトに失敗しました",
      feedbackTitle: "プロフィールフィードバック",
    },
    settingsSite: {
      title: "サイト設定",
      description: "アプリ識別情報と信頼済み Web Origin 設定。",
      panelTitle: "サイト",
      panelDescription: "サイト設定を設定センターへ保存します。",
      failedLoad: "サイト設定の読み込みに失敗しました。既定値を利用します。",
      failedSave: "サイト設定の保存に失敗しました",
      saved: "サイト設定を保存しました",
      fields: {
        appName: "アプリ名",
        baseURL: "Base URL",
        webOrigin: "Web Origin",
      },
      feedbackTitle: "サイトフィードバック",
    },
    settingsAuth: {
      title: "認証設定",
      description: "既定認証とセッションセキュリティポリシー。",
      panelTitle: "認証",
      panelDescription: "認証ポリシーを編集し設定センターへ保存します。",
      failedLoad: "認証設定の読み込みに失敗しました。既定値を利用します。",
      failedSave: "認証設定の保存に失敗しました",
      saved: "認証設定を保存しました",
      fields: {
        defaultAdminEmail: "既定管理者メール",
        sessionTTL: "セッション TTL（秒）",
        secureCookie: "Secure Cookie",
        secureCookieHint: "本番トラフィックでは有効化推奨。",
      },
      feedbackTitle: "認証フィードバック",
    },
    settingsSMTP: {
      title: "SMTP 設定",
      description: "メール転送設定と送信テストエンドポイント。",
      panelTitle: "SMTP",
      panelDescription: "ホスト、ポート、送信者、テンプレートモードを設定します。",
      failedSave: "SMTP 設定の保存に失敗しました",
      failedTest: "SMTP テストに失敗しました",
      saveSuccess: "SMTP 設定を保存しました",
      testSuccess: "SMTP テスト成功",
      fields: {
        host: "Host",
        port: "Port",
        from: "From",
        testRecipient: "テスト宛先",
        templateMailEnabled: "テンプレートメールを有効化",
        templateMailHint: "認証/システムメールで共通テンプレートパイプラインを利用します。",
      },
      saveButton: "SMTP 保存",
      saving: "保存中...",
      testButton: "SMTP テスト",
      testing: "テスト中...",
      emailTemplates: "メールテンプレート",
      releasePolicyTitle: "リリースポリシー",
      releasePolicyDescription: "設定センターと監査ログ経由で SMTP 変更を適用します。",
      releasePolicyBody: "メールログ、タイムアウト分類、リトライ戦略は拡張可能です。",
      feedbackTitle: "SMTP フィードバック",
    },
    settingsStorage: {
      title: "ストレージ設定",
      description: "オブジェクトストレージエンドポイントと presign ポリシー。",
      panelTitle: "ストレージ",
      panelDescription: "バケット、エンドポイント、CDN URL、presign を設定します。",
      failedLoad: "ストレージ設定の読み込みに失敗しました。既定値を利用します。",
      failedSave: "ストレージ設定の保存に失敗しました",
      failedTest: "ストレージテストに失敗しました",
      saveSuccess: "ストレージ設定を保存しました",
      testSuccess: "ストレージテスト成功",
      fields: {
        bucket: "Bucket",
        endpoint: "Endpoint",
        publicBaseURL: "Public Base URL",
        presignEnabled: "presign アップロードを有効化",
        presignHint: "オブジェクトアップロードのメタデータ + presign フロー。",
      },
      saveButton: "ストレージ保存",
      saving: "保存中...",
      testButton: "ストレージテスト",
      testing: "テスト中...",
      policyTitle: "オブジェクトポリシー",
      policyDescription: "クリーンアップ/補償ジョブはワーカーで拡張できます。",
      policyBody: "オブジェクトキー戦略、head/delete フロー、監査フックを再利用できます。",
      feedbackTitle: "ストレージフィードバック",
    },
    blog: {
      createShort: "作成",
    },
    announcements: {
      title: "お知らせ",
      description: "テンプレートの再利用拡張性を検証するためのお知らせモジュール例です。",
      panelTitle: "お知らせ一覧",
      panelDescription: "共有ページ/レイアウト/テーブル部品を再利用できることを示すデモデータです。",
      filters: {
        keyword: "キーワード",
        keywordPlaceholder: "タイトルまたは要約で絞り込み",
        status: "ステータス",
        statusPlaceholder: "draft / published",
      },
      columns: {
        title: "お知らせ",
        status: "ステータス",
        publishedAt: "公開日時",
        actions: "操作",
      },
      actions: {
        publish: "公開",
        unpublish: "公開解除",
      },
      notPublished: "未公開",
      emptyTitle: "お知らせはありません",
      emptyDescription: "最初のお知らせを作成してください。",
      saved: "お知らせステータスを更新しました",
      feedbackTitle: "お知らせフィードバック",
    },
    emailTemplates: {
      section: "設定",
      title: "メールテンプレート",
      description: "SMTP テンプレート内容、プレビュー、テスト送信を管理します。",
      failedLoadList: "テンプレート一覧の読み込みに失敗しました",
      failedLoadSelected: "選択テンプレートの読み込みに失敗しました",
      failedSave: "テンプレート保存に失敗しました",
      failedPreview: "プレビュー生成に失敗しました",
      failedTestSend: "テスト送信に失敗しました",
      saved: "テンプレートを保存しました",
      previewRendered: "プレビューを生成しました",
      testSent: "テストメールを送信しました",
      listTitle: "テンプレート一覧",
      listDescription: "認証/チームフローで使う内蔵テンプレートキー。",
      noTemplatesTitle: "テンプレートがありません",
      noTemplatesDescription: "テンプレートレジストリが空です。",
      columns: {
        key: "キー",
        subject: "件名",
        status: "状態",
      },
      editorTitle: "テンプレートエディタ",
      editorDescription: "件名/本文を更新しプレビュー結果を検証します。",
      fields: {
        templateKey: "テンプレートキー",
        description: "説明",
        subject: "件名",
        body: "本文",
        enabled: "有効",
      },
      buttons: {
        save: "保存",
        preview: "プレビュー",
        sendTest: "テスト送信",
      },
      previewTitle: "プレビュー",
      feedbackTitle: "テンプレートフィードバック",
    },
    seo: {
      section: "設定",
      title: "SEO",
      description: "SEO 既定値、ソーシャルメタデータ、robots/sitemap の挙動を管理します。",
      failedLoad: "SEO 設定の読み込みに失敗しました",
      failedSave: "SEO 設定の保存に失敗しました",
      failedInit: "SEO 設定の初期化に失敗しました",
      saved: "SEO 設定を保存しました",
      initialized: "SEO 設定を初期化しました",
      alreadyInitialized: "SEO 設定はすでに初期化済みです",
      notInitializedTitle: "SEO は未初期化です",
      notInitializedDescription: "まず SEO 既定値を初期化してから編集してください。",
      initButton: "SEO を初期化",
      initializing: "初期化中...",
      saving: "保存中...",
      sections: {
        site: "サイト",
        siteDescription: "サイト識別情報と既定言語の設定。",
        organization: "組織情報",
        organizationDescription: "構造化データの組織情報と連絡先。",
        social: "ソーシャルリンク",
        socialDescription: "ソーシャルメタデータ用のブランド URL。",
        robotsSitemap: "Robots と Sitemap",
        robotsSitemapDescription: "許可/拒否パスと sitemap 生成ポリシー。",
        integrations: "連携",
        integrationsDescription: "検索エンジン検証と分析 ID。",
        toggles: "Schema トグル",
        togglesDescription: "構造化データやパンくずのレンダリング設定。",
      },
      fields: {
        siteName: "サイト名",
        siteDescription: "サイト説明",
        siteURL: "サイト URL",
        defaultLanguage: "既定言語",
        defaultKeywords: "既定キーワード",
        organizationType: "組織タイプ",
        organizationName: "組織名",
        organizationLogo: "組織ロゴ URL",
        organizationDescription: "組織説明",
        contactEmail: "連絡先メール",
        socialTwitter: "Twitter URL",
        socialFacebook: "Facebook URL",
        socialLinkedIn: "LinkedIn URL",
        socialGitHub: "GitHub URL",
        socialYouTube: "YouTube URL",
        robotsAllowPaths: "Robots 許可パス（1 行 1 件）",
        robotsDisallowPaths: "Robots 拒否パス（1 行 1 件）",
        robotsCustomRules: "Robots カスタムルール",
        sitemapIncludePaths: "Sitemap 含むパス（1 行 1 件）",
        sitemapExcludePaths: "Sitemap 除外パス（1 行 1 件）",
        sitemapChangeFreq: "Sitemap 更新頻度",
        sitemapPriority: "Sitemap 優先度",
        googleAnalyticsID: "Google Analytics ID",
        googleVerification: "Google サイト検証",
        bingVerification: "Bing サイト検証",
        defaultOgImage: "既定 OG 画像 URL",
        defaultTwitterCard: "既定 Twitter Card",
        enableStructuredData: "構造化データを有効化",
        enableBreadcrumbs: "パンくずを有効化",
        enableAuthorSchema: "著者 Schema を有効化",
      },
      feedbackTitle: "SEO フィードバック",
    },
  },
};

export function adminT(locale: Locale): AdminMessages {
  return messages[locale] ?? messages.en;
}
