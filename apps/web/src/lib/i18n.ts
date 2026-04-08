import type { ComponentType } from "react";
import {
  BoltIcon,
  CloudIcon,
  CommandLineIcon,
  EnvelopeIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  SunIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { dashboardMessages, type DashboardMessages } from "@/lib/dashboard-i18n";

export const LOCALE_COOKIE_NAME = "locale";

export const locales = ["en", "zh", "ja"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

type Messages = {
  nav: {
    home: string;
    blog: string;
    about: string;
    contact: string;
    settings: string;
    dashboard: string;
    signIn: string;
    openMenu: string;
    language: string;
    theme: string;
    localeLabel: Record<Locale, string>;
    themeSystem: string;
    themeLight: string;
    themeDark: string;
  };
  common: {
    dashboard: string;
    settings: string;
    signIn: string;
    signUp: string;
    forgotPassword: string;
    resetPassword: string;
    verifyEmail: string;
    backToSignIn: string;
    profile: string;
    security: string;
    sessions: string;
    changePassword: string;
    teamInvite: string;
    signOut: string;
    backToDashboard: string;
    billing: string;
    marketplace: string;
    teams: string;
    admin: string;
    notifications: string;
  };
  auth: {
    signInTitle: string;
    signInDescription: string;
    signInAction: string;
    signUpTitle: string;
    signUpDescription: string;
    signUpAction: string;
    forgotTitle: string;
    forgotDescription: string;
    forgotAction: string;
    forgotSuccess: string;
    forgotDevResetLinkPrefix: string;
    resetTitle: string;
    resetDescription: string;
    resetAction: string;
    verifyTitle: string;
    verifyDescription: string;
    requestCode: string;
    confirmEmail: string;
    email: string;
    password: string;
    newPassword: string;
    verificationCode: string;
    displayName: string;
    alreadyHaveAccount: string;
    createAccount: string;
    needVerificationCode: string;
    verifyEmailSuccess: string;
    verifyEmailSuccessHint: string;
    verificationFailed: string;
    requestVerificationFailed: string;
    csrfBlockedHint: string;
    verifyCsrfBlockedHint: string;
    requestCsrfBlockedHint: string;
    verificationCodeSentDevHint: string;
    resetLinkRequiredTitle: string;
    resetLinkRequiredDescription: string;
    sendResetInstructions: string;
    signInWithPassword: string;
    createAccountWithPassword: string;
  };
  landing: {
    badgeFree: string;
    title: string;
    description: string;
    viewGithub: string;
    tryDemo: string;
    featuresEyebrow: string;
    featuresTitle: string;
    featuresDescription: string;
    featureTitles: string[];
    featureItems: string[];
    featureIcons: Array<ComponentType<{ className?: string; "aria-hidden"?: boolean }>>;
    faqTitle: string;
    faqItems: Array<{ question: string; answer: string }>;
  };
  legal: {
    termsTitle: string;
    privacyTitle: string;
    termsDescription: string;
    privacyDescription: string;
    termsIntro: string;
    privacyIntro: string;
    termsSections: Array<{ title: string; body: string }>;
    privacySections: Array<{ title: string; body: string }>;
    lastUpdated: string;
    returnHome: string;
  };
  marketing: {
    about: {
      title: string;
      description: string;
      heading: string;
      lead: string;
      tipTitle: string;
      tips: string[];
      ctaHome: string;
      ctaSignIn: string;
    };
    contact: {
      title: string;
      description: string;
      heading: string;
      lead: string;
      emailLabel: string;
      replySoon: string;
      ctaHome: string;
    };
  };
  footer: {
    legal: string;
    company: string;
    social: string;
    blog: string;
    about: string;
    contact: string;
    terms: string;
    privacy: string;
    home: string;
    socialHint: string;
    rightsReserved: string;
    admin: string;
  };
  blog: {
    title: string;
    subtitle: string;
    latest: string;
    noPosts: string;
    backToBlog: string;
    by: string;
    contentNotFound: string;
    previewModeTitle: string;
    previewModeBodyPublished: string;
    previewModeBodyUnpublished: string;
  };
  dashboard: DashboardMessages;
};

export const messages: Record<Locale, Messages> = {
  en: {
    nav: {
      home: "Home",
      blog: "Blog",
      about: "About",
      contact: "Contact",
      settings: "Settings",
      dashboard: "Dashboard",
      signIn: "Sign In",
      openMenu: "Open menu",
      language: "Language",
      theme: "Theme",
      localeLabel: {
        en: "English",
        zh: "Chinese",
        ja: "Japanese",
      },
      themeSystem: "System default",
      themeLight: "Light",
      themeDark: "Dark",
    },
    common: {
      dashboard: "Dashboard",
      settings: "Settings",
      signIn: "Sign In",
      signUp: "Sign Up",
      forgotPassword: "Forgot Password",
      resetPassword: "Reset Password",
      verifyEmail: "Verify Email",
      backToSignIn: "Back to sign in",
      profile: "Profile",
      security: "Security",
      sessions: "Sessions",
      changePassword: "Change Password",
      teamInvite: "Team Invite",
      signOut: "Sign out",
      backToDashboard: "Back to dashboard",
      billing: "Billing",
      marketplace: "Marketplace",
      teams: "Teams",
      admin: "Admin",
      notifications: "Notifications",
    },
    auth: {
      signInTitle: "Sign in to your account",
      signInDescription: "Sign in with email/password, passkey, or Google SSO.",
      signInAction: "Sign In",
      signUpTitle: "Create your account",
      signUpDescription: "Create account with email/password, or use passkey and Google SSO.",
      signUpAction: "Sign Up",
      forgotTitle: "Reset your password",
      forgotDescription: "Send reset instructions to your email and recover account access.",
      forgotAction: "Send reset email",
      forgotSuccess: "If an account exists with that email, we've sent reset instructions. In development, the reset link is printed in the API server logs.",
      forgotDevResetLinkPrefix: "Development reset link:",
      resetTitle: "Reset Password",
      resetDescription: "Choose a new password for your account.",
      resetAction: "Reset Password",
      verifyTitle: "Verify your email",
      verifyDescription: "Use the verification code we sent to confirm your email.",
      requestCode: "Request verification code",
      confirmEmail: "Confirm email",
      email: "Email",
      password: "Password",
      newPassword: "New Password",
      verificationCode: "Verification Code",
      displayName: "Display Name",
      alreadyHaveAccount: "Already have an account?",
      createAccount: "Create account",
      needVerificationCode: "Need a verification code?",
      verifyEmailSuccess: "Email verified.",
      verifyEmailSuccessHint: "You can sign in now.",
      verificationFailed: "Verification failed",
      requestVerificationFailed: "Failed to request verification code",
      csrfBlockedHint: "Request blocked by CSRF. Refresh page and retry.",
      verifyCsrfBlockedHint: "Verification blocked by CSRF. Refresh page and retry.",
      requestCsrfBlockedHint: "Request blocked by CSRF. Refresh page and retry.",
      verificationCodeSentDevHint: "Verification code sent. Check server logs in development.",
      resetLinkRequiredTitle: "Reset link required",
      resetLinkRequiredDescription: "This page must be opened from the reset link sent to your email.",
      sendResetInstructions: "Send reset instructions",
      signInWithPassword: "Sign In with Password",
      createAccountWithPassword: "Create Account with Password",
    },
    landing: {
      badgeFree: "100% Free & Open Source",
      title: "Production-Ready SaaS Template",
      description:
        "A modern, open-source template for building SaaS applications with Astro + React + Go.",
      viewGithub: "View on GitHub",
      tryDemo: "Try Demo",
      featuresEyebrow: "Production Ready",
      featuresTitle: "Everything you need to build a SaaS",
      featuresDescription:
        "Start with a complete foundation. Essential modules are already wired end-to-end.",
      featureTitles: [
        "Authentication Ready",
        "Dashboard Workspace",
        "Admin Modules",
        "Infra Integrations",
        "Tenant Permissions",
        "Deployment Baseline",
      ],
      featureItems: [
        "Authentication with sign in, sign up, verification, and reset password flows",
        "Dashboard workspace with teams, billing, marketplace, and account center",
        "Admin modules for users, roles, files, jobs, audit logs, and settings",
        "PostgreSQL + Redis + R2 + SMTP integration with production-focused defaults",
        "Tenant-aware data model and role-based permissions for SaaS scenarios",
        "Docker and Kubernetes deployment baseline for scalable environments",
      ],
      featureIcons: [
        ShieldCheckIcon,
        EnvelopeIcon,
        BoltIcon,
        SunIcon,
        CloudIcon,
        CommandLineIcon,
        RocketLaunchIcon,
        UserGroupIcon,
      ],
      faqTitle: "Frequently asked questions",
      faqItems: [
        {
          question: "What is included in this template?",
          answer:
            "It includes complete auth flows, dashboard modules, admin modules, settings center, and infrastructure-ready backend services.",
        },
        {
          question: "Can I use this as a production SaaS foundation?",
          answer:
            "Yes. The template is designed with modular architecture, multi-tenant awareness, and deploy-ready runtime configuration.",
        },
        {
          question: "How is local development handled?",
          answer:
            "Use one root command to start both web and API. The project reads root .env and connects to PostgreSQL, Redis, and SMTP services.",
        },
        {
          question: "Is this template easy to extend for business modules?",
          answer:
            "Yes. Frontend features and backend services are split by domain, so new modules can be added without breaking core foundations.",
        },
        {
          question: "Does this template support multilingual interfaces?",
          answer:
            "Yes. Core pages and dashboard areas support English, Chinese, and Japanese with a unified locale switch flow.",
        },
      ],
    },
    legal: {
      termsTitle: "Terms of Service",
      privacyTitle: "Privacy Policy",
      termsDescription: "Terms of service for this site",
      privacyDescription: "Privacy policy for this site",
      termsIntro: "This is a template Terms of Service page. Replace this content with your real terms before going live.",
      privacyIntro: "This is a template Privacy Policy page. Replace this content with your real policy before going live.",
      termsSections: [
        {
          title: "1. Use of the Service",
          body: "You agree to use the service responsibly and comply with applicable laws.",
        },
        {
          title: "2. Accounts",
          body: "You are responsible for maintaining the security of your account.",
        },
        {
          title: "3. Payments",
          body: "If you enable billing, payments and refunds are subject to your billing policy.",
        },
        {
          title: "4. Changes",
          body: "We may update these terms from time to time.",
        },
        {
          title: "5. Contact",
          body: "For questions about these terms, contact the site owner.",
        },
      ],
      privacySections: [
        {
          title: "1. What we collect",
          body: "We may collect account information such as email and profile details.",
        },
        {
          title: "2. How we use data",
          body: "We use data to provide and improve the service (authentication, billing, support).",
        },
        {
          title: "3. Cookies",
          body: "We use cookies for session authentication.",
        },
        {
          title: "4. Data retention",
          body: "We retain data as needed to operate the service and comply with legal obligations.",
        },
        {
          title: "5. Contact",
          body: "For privacy questions, contact the site owner.",
        },
      ],
      lastUpdated: "Last updated",
      returnHome: "Return to Home",
    },
    marketing: {
      about: {
        title: "About",
        description: "About this SaaS template",
        heading: "About this template",
        lead: "This project is a production-oriented SaaS starter with Go backend and Astro + React frontend.",
        tipTitle: "What to customize first",
        tips: [
          "Update site name, logo, and legal pages.",
          "Configure SMTP, storage, and payment providers.",
          "Adjust role permissions and tenant defaults for your business model.",
        ],
        ctaHome: "Back to home",
        ctaSignIn: "Go to sign in",
      },
      contact: {
        title: "Contact",
        description: "Contact and support",
        heading: "Contact us",
        lead: "Questions about this template or your deployment? Reach us via email and we'll respond as soon as possible.",
        emailLabel: "Support Email",
        replySoon: "We usually reply within one business day.",
        ctaHome: "Back to home",
      },
    },
    footer: {
      legal: "Legal",
      company: "Company",
      social: "Social",
      blog: "Blog",
      about: "About",
      contact: "Contact",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      home: "Home",
      socialHint: "Add your links here.",
      rightsReserved: "All rights reserved.",
      admin: "Admin",
    },
    blog: {
      title: "Blog",
      subtitle: "Latest posts, product updates, and implementation notes.",
      latest: "Latest posts from the project",
      noPosts: "No published posts.",
      backToBlog: "Back to blog",
      by: "By ",
      contentNotFound: "Content not found.",
      previewModeTitle: "Preview mode",
      previewModeBodyPublished: "This preview reflects the current published post content.",
      previewModeBodyUnpublished: "This preview renders draft content that is not public yet.",
    },
    dashboard: dashboardMessages.en,
  },
  zh: {
    nav: {
      home: "首页",
      blog: "博客",
      about: "关于",
      contact: "联系",
      settings: "设置",
      dashboard: "控制台",
      signIn: "登录",
      openMenu: "打开菜单",
      language: "语言",
      theme: "主题",
      localeLabel: {
        en: "英文",
        zh: "中文",
        ja: "日文",
      },
      themeSystem: "跟随系统",
      themeLight: "浅色",
      themeDark: "深色",
    },
    common: {
      dashboard: "控制台",
      settings: "设置",
      signIn: "登录",
      signUp: "注册",
      forgotPassword: "忘记密码",
      resetPassword: "重置密码",
      verifyEmail: "邮箱验证",
      backToSignIn: "返回登录",
      profile: "个人资料",
      security: "安全",
      sessions: "会话",
      changePassword: "修改密码",
      teamInvite: "团队邀请",
      signOut: "退出登录",
      backToDashboard: "返回控制台",
      billing: "账单",
      marketplace: "市场",
      teams: "团队",
      admin: "管理后台",
      notifications: "通知",
    },
    auth: {
      signInTitle: "登录你的账户",
      signInDescription: "使用邮箱/密码、Passkey 或 Google SSO 登录。",
      signInAction: "登录",
      signUpTitle: "创建账户",
      signUpDescription: "使用邮箱/密码注册，或使用 Passkey 与 Google SSO。",
      signUpAction: "注册",
      forgotTitle: "重置密码",
      forgotDescription: "发送重置邮件并恢复账户访问。",
      forgotAction: "发送重置邮件",
      forgotSuccess: "若该邮箱已注册，我们已发送重置指引。开发环境下重置链接会打印在 API 服务日志中。",
      forgotDevResetLinkPrefix: "开发环境重置链接：",
      resetTitle: "重置密码",
      resetDescription: "请设置你的新密码。",
      resetAction: "确认重置",
      verifyTitle: "验证你的邮箱",
      verifyDescription: "输入我们发送到邮箱的验证码以完成验证。",
      requestCode: "获取验证码",
      confirmEmail: "确认邮箱",
      email: "邮箱",
      password: "密码",
      newPassword: "新密码",
      verificationCode: "验证码",
      displayName: "显示名称",
      alreadyHaveAccount: "已有账户？",
      createAccount: "创建账户",
      needVerificationCode: "需要验证码？",
      verifyEmailSuccess: "邮箱验证成功。",
      verifyEmailSuccessHint: "现在可以登录了。",
      verificationFailed: "邮箱验证失败",
      requestVerificationFailed: "请求验证码失败",
      csrfBlockedHint: "请求被 CSRF 拦截，请刷新页面后重试。",
      verifyCsrfBlockedHint: "验证请求被 CSRF 拦截，请刷新页面后重试。",
      requestCsrfBlockedHint: "请求被 CSRF 拦截，请刷新页面后重试。",
      verificationCodeSentDevHint: "验证码已发送。开发环境请查看服务端日志。",
      resetLinkRequiredTitle: "需要重置链接",
      resetLinkRequiredDescription: "请通过邮箱中的重置链接打开此页面。",
      sendResetInstructions: "发送重置指引",
      signInWithPassword: "使用密码登录",
      createAccountWithPassword: "使用密码创建账户",
    },
    landing: {
      badgeFree: "100% 免费且开源",
      title: "可直接上线的 SaaS 模板",
      description: "基于 Astro + React + Go 的现代开源 SaaS 模板，开箱即可扩展业务。",
      viewGithub: "查看 GitHub",
      tryDemo: "体验 Demo",
      featuresEyebrow: "生产可用",
      featuresTitle: "构建 SaaS 所需能力已内置",
      featuresDescription: "从完整基础设施开始，核心模块已经端到端打通。",
      featureTitles: [
        "认证体系",
        "控制台工作区",
        "管理后台模块",
        "基础设施集成",
        "租户权限模型",
        "部署基线",
      ],
      featureItems: [
        "包含登录、注册、邮箱验证、重置密码等完整认证流程",
        "内置控制台工作区：团队、账单、市场、账户中心",
        "内置管理后台模块：用户、角色、文件、任务、审计、系统设置",
        "集成 PostgreSQL + Redis + R2 + SMTP，并提供生产化默认配置",
        "支持租户隔离模型与角色权限控制，贴合 SaaS 场景",
        "提供 Docker 与 Kubernetes 部署基础结构，便于扩展",
      ],
      featureIcons: [
        ShieldCheckIcon,
        EnvelopeIcon,
        BoltIcon,
        SunIcon,
        CloudIcon,
        CommandLineIcon,
        RocketLaunchIcon,
        UserGroupIcon,
      ],
      faqTitle: "常见问题",
      faqItems: [
        {
          question: "这个模板包含哪些能力？",
          answer:
            "包含完整认证流程、控制台模块、管理后台模块、设置中心以及可直接接入基础设施的后端服务。",
        },
        {
          question: "可以作为生产级 SaaS 基础吗？",
          answer:
            "可以。模板采用模块化架构，具备多租户意识与部署就绪配置，适合作为业务系统底座。",
        },
        {
          question: "本地开发如何启动？",
          answer:
            "使用根目录一个命令同时启动前端与后端。项目会读取根目录 .env 并连接 PostgreSQL、Redis、SMTP。",
        },
        {
          question: "后续扩展业务模块是否方便？",
          answer:
            "方便。前后端都按领域模块拆分，新功能可以独立接入并复用现有基础能力。",
        },
        {
          question: "是否支持多语言界面？",
          answer:
            "支持。核心页面和控制台已支持中英日三种语言，并统一了语言切换交互。",
        },
      ],
    },
    legal: {
      termsTitle: "服务条款",
      privacyTitle: "隐私政策",
      termsDescription: "本站服务条款",
      privacyDescription: "本站隐私政策",
      termsIntro: "这是一个模板服务条款页面，上线前请替换为你的真实条款。",
      privacyIntro: "这是一个模板隐私政策页面，上线前请替换为你的真实政策。",
      termsSections: [
        {
          title: "1. 服务使用",
          body: "你同意合理使用本服务，并遵守适用法律法规。",
        },
        {
          title: "2. 账号",
          body: "你需要自行负责账号安全，包括密码保管等。",
        },
        {
          title: "3. 支付",
          body: "如果你启用了计费，支付和退款以你的计费政策为准。",
        },
        {
          title: "4. 变更",
          body: "我们可能会不定期更新这些条款。",
        },
        {
          title: "5. 联系",
          body: "如有条款问题，请联系网站运营方。",
        },
      ],
      privacySections: [
        {
          title: "1. 我们收集什么",
          body: "我们可能收集账号信息，例如邮箱和资料信息。",
        },
        {
          title: "2. 数据如何使用",
          body: "我们使用这些数据来提供和改进服务（登录、计费、支持等）。",
        },
        {
          title: "3. Cookie",
          body: "我们使用 Cookie 用于会话登录等功能。",
        },
        {
          title: "4. 数据保留",
          body: "我们会在提供服务和履行法律义务所需的范围内保留数据。",
        },
        {
          title: "5. 联系",
          body: "如有隐私问题，请联系网站运营方。",
        },
      ],
      lastUpdated: "最后更新",
      returnHome: "返回首页",
    },
    marketing: {
      about: {
        title: "关于",
        description: "关于此 SaaS 模板",
        heading: "关于这个模板",
        lead: "这是一个面向生产的 SaaS 脚手架，后端使用 Go，前端使用 Astro + React。",
        tipTitle: "优先自定义建议",
        tips: [
          "先更新站点名称、Logo 和法律页面内容。",
          "配置 SMTP、对象存储和支付服务。",
          "根据业务模型调整角色权限和租户默认策略。",
        ],
        ctaHome: "返回首页",
        ctaSignIn: "前往登录",
      },
      contact: {
        title: "联系",
        description: "联系与支持",
        heading: "联系我们",
        lead: "如果你在使用模板或部署过程中有问题，可以通过邮箱联系我们，我们会尽快回复。",
        emailLabel: "支持邮箱",
        replySoon: "我们通常会在 1 个工作日内回复。",
        ctaHome: "返回首页",
      },
    },
    footer: {
      legal: "法律",
      company: "公司",
      social: "社交",
      blog: "博客",
      about: "关于",
      contact: "联系",
      terms: "服务条款",
      privacy: "隐私政策",
      home: "首页",
      socialHint: "可在此添加你的社交链接。",
      rightsReserved: "保留所有权利。",
      admin: "管理后台",
    },
    blog: {
      title: "博客",
      subtitle: "最新文章、产品更新与实现记录。",
      latest: "项目最新博客",
      noPosts: "暂无已发布文章。",
      backToBlog: "返回博客",
      by: "作者：",
      contentNotFound: "暂无内容。",
      previewModeTitle: "预览模式",
      previewModeBodyPublished: "当前预览展示的是已发布文章内容。",
      previewModeBodyUnpublished: "当前预览展示的是尚未公开的草稿内容。",
    },
    dashboard: dashboardMessages.zh,
  },
  ja: {
    nav: {
      home: "ホーム",
      blog: "ブログ",
      about: "概要",
      contact: "お問い合わせ",
      settings: "設定",
      dashboard: "ダッシュボード",
      signIn: "サインイン",
      openMenu: "メニューを開く",
      language: "言語",
      theme: "テーマ",
      localeLabel: {
        en: "英語",
        zh: "中国語",
        ja: "日本語",
      },
      themeSystem: "システム設定",
      themeLight: "ライト",
      themeDark: "ダーク",
    },
    common: {
      dashboard: "ダッシュボード",
      settings: "設定",
      signIn: "サインイン",
      signUp: "サインアップ",
      forgotPassword: "パスワードを忘れた",
      resetPassword: "パスワード再設定",
      verifyEmail: "メール認証",
      backToSignIn: "サインインに戻る",
      profile: "プロフィール",
      security: "セキュリティ",
      sessions: "セッション",
      changePassword: "パスワード変更",
      teamInvite: "チーム招待",
      signOut: "サインアウト",
      backToDashboard: "ダッシュボードへ戻る",
      billing: "請求",
      marketplace: "マーケットプレイス",
      teams: "チーム",
      admin: "管理",
      notifications: "通知",
    },
    auth: {
      signInTitle: "アカウントにサインイン",
      signInDescription: "メール/パスワード、Passkey、Google SSO でサインインできます。",
      signInAction: "サインイン",
      signUpTitle: "アカウントを作成",
      signUpDescription: "メール/パスワード、または Passkey と Google SSO で登録できます。",
      signUpAction: "サインアップ",
      forgotTitle: "パスワードをリセット",
      forgotDescription: "リセット手順をメールで送信します。",
      forgotAction: "リセットメール送信",
      forgotSuccess: "アカウントが存在する場合、リセット手順を送信しました。開発環境では API ログにリンクが表示されます。",
      forgotDevResetLinkPrefix: "開発用リセットリンク：",
      resetTitle: "パスワード再設定",
      resetDescription: "新しいパスワードを設定してください。",
      resetAction: "パスワード再設定",
      verifyTitle: "メールアドレス認証",
      verifyDescription: "送信された認証コードを入力してください。",
      requestCode: "認証コード送信",
      confirmEmail: "メールを確認",
      email: "メール",
      password: "パスワード",
      newPassword: "新しいパスワード",
      verificationCode: "認証コード",
      displayName: "表示名",
      alreadyHaveAccount: "すでにアカウントをお持ちですか？",
      createAccount: "アカウント作成",
      needVerificationCode: "認証コードが必要ですか？",
      verifyEmailSuccess: "メール認証が完了しました。",
      verifyEmailSuccessHint: "サインインできます。",
      verificationFailed: "認証に失敗しました",
      requestVerificationFailed: "認証コードのリクエストに失敗しました",
      csrfBlockedHint: "CSRF によりブロックされました。ページを再読み込みして再試行してください。",
      verifyCsrfBlockedHint: "認証リクエストが CSRF によりブロックされました。再読み込みして再試行してください。",
      requestCsrfBlockedHint: "リクエストが CSRF によりブロックされました。再読み込みして再試行してください。",
      verificationCodeSentDevHint: "認証コードを送信しました。開発環境ではサーバーログを確認してください。",
      resetLinkRequiredTitle: "リセットリンクが必要です",
      resetLinkRequiredDescription: "このページはメールのリセットリンクから開いてください。",
      sendResetInstructions: "リセット手順を送信",
      signInWithPassword: "パスワードでサインイン",
      createAccountWithPassword: "パスワードでアカウント作成",
    },
    landing: {
      badgeFree: "100% 無料・オープンソース",
      title: "本番対応 SaaS テンプレート",
      description:
        "Astro + React + Go で構築された、すぐに拡張できるモダンな SaaS テンプレートです。",
      viewGithub: "GitHubを見る",
      tryDemo: "デモを試す",
      featuresEyebrow: "Production Ready",
      featuresTitle: "SaaS 開発に必要な機能を標準搭載",
      featuresDescription:
        "完成度の高い土台から開始し、主要モジュールはエンドツーエンドで実装済みです。",
      featureTitles: [
        "認証フロー",
        "ダッシュボード",
        "管理モジュール",
        "基盤統合",
        "テナント権限",
        "デプロイ基盤",
      ],
      featureItems: [
        "サインイン、サインアップ、メール認証、パスワード再設定を含む認証フロー",
        "チーム、請求、マーケットプレイス、アカウントを備えたダッシュボード",
        "ユーザー、ロール、ファイル、ジョブ、監査、設定の管理モジュール",
        "PostgreSQL + Redis + R2 + SMTP を統合した本番向け初期構成",
        "SaaS 向けのテナント分離モデルとロールベース権限制御",
        "スケール運用を見据えた Docker / Kubernetes 基盤",
      ],
      featureIcons: [
        ShieldCheckIcon,
        EnvelopeIcon,
        BoltIcon,
        SunIcon,
        CloudIcon,
        CommandLineIcon,
        RocketLaunchIcon,
        UserGroupIcon,
      ],
      faqTitle: "よくある質問",
      faqItems: [
        {
          question: "このテンプレートには何が含まれますか？",
          answer:
            "認証、ダッシュボード、管理画面、設定センター、そして本番運用向けのバックエンド基盤が含まれます。",
        },
        {
          question: "本番 SaaS のベースとして使えますか？",
          answer:
            "はい。モジュール分割、マルチテナント対応、デプロイ前提の設定により、実運用ベースとして利用できます。",
        },
        {
          question: "ローカル開発はどう開始しますか？",
          answer:
            "ルートの単一コマンドで Web と API を同時起動できます。.env を読み込み、PostgreSQL・Redis・SMTP に接続します。",
        },
        {
          question: "ビジネス機能の追加は簡単ですか？",
          answer:
            "簡単です。フロントエンドとバックエンドはドメイン単位で分割されており、既存基盤を再利用して拡張できます。",
        },
        {
          question: "多言語 UI をサポートしていますか？",
          answer:
            "はい。主要ページとダッシュボードは英語・中国語・日本語に対応し、言語切替フローも統一されています。",
        },
      ],
    },
    legal: {
      termsTitle: "利用規約",
      privacyTitle: "プライバシーポリシー",
      termsDescription: "本サイトの利用規約",
      privacyDescription: "本サイトのプライバシーポリシー",
      termsIntro: "これはテンプレートの利用規約ページです。公開前に実際の規約に置き換えてください。",
      privacyIntro: "これはテンプレートのプライバシーポリシーページです。公開前に実際のポリシーに置き換えてください。",
      termsSections: [
        {
          title: "1. サービスの利用",
          body: "適用される法令を遵守し、適切に本サービスを利用することに同意します。",
        },
        {
          title: "2. アカウント",
          body: "パスワード等を含むアカウントの安全管理は利用者の責任です。",
        },
        {
          title: "3. 支払い",
          body: "課金を有効にした場合、支払いおよび返金は当社の課金ポリシーに従います。",
        },
        {
          title: "4. 変更",
          body: "当社は必要に応じて本規約を更新することがあります。",
        },
        {
          title: "5. お問い合わせ",
          body: "本規約に関するお問い合わせはサイト運営者までご連絡ください。",
        },
      ],
      privacySections: [
        {
          title: "1. 収集する情報",
          body: "メールアドレスやプロフィール情報などのアカウント情報を収集する場合があります。",
        },
        {
          title: "2. 利用目的",
          body: "認証、課金、サポートなど、サービス提供・改善のために利用します。",
        },
        {
          title: "3. Cookie",
          body: "ログイン等のために Cookie を使用します。",
        },
        {
          title: "4. 保管期間",
          body: "サービス提供および法令遵守に必要な範囲でデータを保持します。",
        },
        {
          title: "5. お問い合わせ",
          body: "プライバシーに関するお問い合わせはサイト運営者までご連絡ください。",
        },
      ],
      lastUpdated: "最終更新",
      returnHome: "ホームに戻る",
    },
    marketing: {
      about: {
        title: "概要",
        description: "この SaaS テンプレートについて",
        heading: "このテンプレートについて",
        lead: "このプロジェクトは、Go バックエンドと Astro + React フロントエンドで構築された本番向け SaaS スターターです。",
        tipTitle: "最初に調整すべき項目",
        tips: [
          "サイト名、ロゴ、利用規約/プライバシーページを更新する。",
          "SMTP、オブジェクトストレージ、決済プロバイダを設定する。",
          "ビジネス要件に合わせて権限とテナント初期設定を調整する。",
        ],
        ctaHome: "ホームへ戻る",
        ctaSignIn: "サインインへ",
      },
      contact: {
        title: "お問い合わせ",
        description: "連絡先とサポート",
        heading: "お問い合わせ",
        lead: "テンプレートやデプロイに関する質問はメールでご連絡ください。できるだけ早く返信します。",
        emailLabel: "サポートメール",
        replySoon: "通常 1 営業日以内に返信します。",
        ctaHome: "ホームへ戻る",
      },
    },
    footer: {
      legal: "法務",
      company: "会社",
      social: "ソーシャル",
      blog: "ブログ",
      about: "概要",
      contact: "お問い合わせ",
      terms: "利用規約",
      privacy: "プライバシーポリシー",
      home: "ホーム",
      socialHint: "ここにリンクを追加してください。",
      rightsReserved: "All rights reserved.",
      admin: "管理",
    },
    blog: {
      title: "ブログ",
      subtitle: "最新記事、プロダクト更新、実装ノート。",
      latest: "最新のブログ投稿",
      noPosts: "公開済み記事がありません。",
      backToBlog: "ブログへ戻る",
      by: "By ",
      contentNotFound: "コンテンツが見つかりません。",
      previewModeTitle: "プレビューモード",
      previewModeBodyPublished: "このプレビューは現在公開中の記事内容を表示しています。",
      previewModeBodyUnpublished: "このプレビューはまだ未公開の下書き内容を表示しています。",
    },
    dashboard: dashboardMessages.ja,
  },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getLocaleFromCookieHeader(cookieHeader: string | null): Locale | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((item) => item.trim());
  for (const part of parts) {
    if (!part.startsWith(`${LOCALE_COOKIE_NAME}=`)) continue;
    const raw = part.slice(`${LOCALE_COOKIE_NAME}=`.length).trim().toLowerCase();
    if (isLocale(raw)) return raw;
  }
  return null;
}

export function getLocaleFromAcceptLanguage(value: string | null): Locale | null {
  const text = (value || "").toLowerCase();
  if (!text) return null;
  if (text.includes("zh")) return "zh";
  if (text.includes("ja")) return "ja";
  if (text.includes("en")) return "en";
  return null;
}

export function getPreferredLocale(request: Request): Locale {
  return (
    getLocaleFromCookieHeader(request.headers.get("cookie")) ||
    getLocaleFromAcceptLanguage(request.headers.get("accept-language")) ||
    defaultLocale
  );
}

export function getClientLocale(): Locale {
  if (typeof document === "undefined") return defaultLocale;
  const match = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${LOCALE_COOKIE_NAME}=`));
  if (!match) return defaultLocale;
  const raw = decodeURIComponent(match.slice(`${LOCALE_COOKIE_NAME}=`.length)).toLowerCase();
  return isLocale(raw) ? raw : defaultLocale;
}

export function t(locale: Locale) {
  return messages[locale];
}

export type MessageCatalog = (typeof messages)[Locale];

type Primitive = string | number | boolean | null | undefined;
type DotPath<T> =
  T extends Primitive ? never
  : {
      [K in keyof T & string]:
        T[K] extends Primitive
          ? K
          : T[K] extends Array<unknown>
            ? K
            : `${K}.${DotPath<T[K]>}` | K;
    }[keyof T & string];

function getByPath(source: unknown, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = source;
  for (const part of parts) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

export function tx(locale: Locale, key: DotPath<MessageCatalog>, fallback?: string): string {
  const value = getByPath(messages[locale], key);
  if (typeof value === "string") return value;
  const fallbackValue = getByPath(messages[defaultLocale], key);
  if (typeof fallbackValue === "string") return fallbackValue;
  return fallback ?? key;
}
