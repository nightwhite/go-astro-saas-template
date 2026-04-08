package admin

type Handler struct {
	overviewService     OverviewService
	settingsService     SettingsService
	mailTemplateService MailTemplateService
	userService         UserService
	fileService         FileService
	roleService         RoleService
	jobService          JobService
	auditService        AuditService
	billingService      BillingService
	blogService         BlogService
}

func NewHandler(
	overviewService OverviewService,
	settingsService SettingsService,
	mailTemplateService MailTemplateService,
	userService UserService,
	fileService FileService,
	roleService RoleService,
	jobService JobService,
	auditService AuditService,
	billingService BillingService,
	blogService BlogService,
) *Handler {
	return &Handler{
		overviewService:     overviewService,
		settingsService:     settingsService,
		mailTemplateService: mailTemplateService,
		userService:         userService,
		fileService:         fileService,
		roleService:         roleService,
		jobService:          jobService,
		auditService:        auditService,
		billingService:      billingService,
		blogService:         blogService,
	}
}
