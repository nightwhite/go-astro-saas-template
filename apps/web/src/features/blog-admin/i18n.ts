import type { Locale } from "@/lib/i18n";

export interface BlogAdminMessages {
  title: string;
  section: string;
  description: string;
  createAction: string;
  createTitle: string;
  editTitle: string;
  createDescription: string;
  editDescription: string;
  loadFailed: string;
  createFailed: string;
  updateFailed: string;
  saveTranslationFailed: string;
  loadTranslationFailed: string;
  deleteFailed: string;
  deleted: string;
  deleting: string;
  cacheCleared: string;
  cacheClearFailed: string;
  translationDeleted: string;
  deletingTranslation: string;
  publish: string;
  unpublish: string;
  publishing: string;
  unpublishing: string;
  published: string;
  unpublished: string;
  previewLink: string;
  previewLinkFailed: string;
  previewLinkCreated: string;
  saveSettings: string;
  saveTranslation: string;
  saving: string;
  saved: string;
  backToList: string;
  noPosts: string;
  noPostsDescription: string;
  applyFilters: string;
  filters: {
    slug: string;
    status: string;
    language: string;
  };
  table: {
    slug: string;
    status: string;
    languages: string;
    publishedAt: string;
    actions: string;
  };
  status: {
    draft: string;
    published: string;
    archived: string;
  };
  fields: {
    slug: string;
    defaultLanguage: string;
    authorName: string;
    postStatus: string;
    featuredImage: string;
    adminNote: string;
    title: string;
    excerpt: string;
    content: string;
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
  placeholders: {
    slug: string;
    defaultLanguage: string;
    authorName: string;
    featuredImage: string;
    keywords: string;
    slugFilter: string;
    statusFilter: string;
    languageFilter: string;
  };
  confirm: {
    deletePost: string;
    deleteTranslation: string;
  };
  preview: {
    title: string;
    open: string;
    close: string;
  };
  actions: {
    edit: string;
    delete: string;
    refresh: string;
    clearCache: string;
  };
  media: {
    title: string;
    description: string;
    open: string;
    upload: string;
    uploading: string;
    loadMore: string;
    empty: string;
    loadFailed: string;
    uploadFailed: string;
    deleteFailed: string;
  };
  pagination: {
    prev: string;
    next: string;
  };
  loadingText: string;
}

const messages: Record<Locale, BlogAdminMessages> = {
  en: {
    title: "Blog",
    section: "Content",
    description: "Manage posts, translations, publishing state, and preview links.",
    createAction: "Create Post",
    createTitle: "Create Blog Post",
    editTitle: "Edit Blog Post",
    createDescription: "Create a post shell first, then edit translations and publish.",
    editDescription: "Manage metadata, localized content, publish state, and preview links.",
    loadFailed: "Failed to load blog posts",
    createFailed: "Failed to create blog post",
    updateFailed: "Failed to update blog settings",
    saveTranslationFailed: "Failed to save translation",
    loadTranslationFailed: "Failed to load translation",
    deleteFailed: "Failed to delete",
    deleted: "Deleted",
    deleting: "Deleting...",
    cacheCleared: "Blog cache cleared",
    cacheClearFailed: "Failed to clear blog cache",
    translationDeleted: "Translation deleted",
    deletingTranslation: "Deleting translation...",
    publish: "Publish",
    unpublish: "Unpublish",
    publishing: "Publishing...",
    unpublishing: "Unpublishing...",
    published: "Published",
    unpublished: "Unpublished",
    previewLink: "Create Preview Link",
    previewLinkFailed: "Failed to create preview link",
    previewLinkCreated: "Preview link created and copied",
    saveSettings: "Save Settings",
    saveTranslation: "Save Translation",
    saving: "Saving...",
    saved: "Saved",
    backToList: "Back to Blog",
    noPosts: "No posts found",
    noPostsDescription: "Create your first post to start publishing.",
    applyFilters: "Apply filters",
    filters: {
      slug: "Slug",
      status: "Status",
      language: "Language",
    },
    table: {
      slug: "Slug",
      status: "Status",
      languages: "Languages",
      publishedAt: "Published",
      actions: "Actions",
    },
    status: {
      draft: "Draft",
      published: "Published",
      archived: "Archived",
    },
    fields: {
      slug: "Slug",
      defaultLanguage: "Default language",
      authorName: "Author name",
      postStatus: "Status",
      featuredImage: "Featured image URL",
      adminNote: "Admin note",
      title: "Title",
      excerpt: "Excerpt",
      content: "Content (Markdown)",
      metaTitle: "Meta title",
      metaDescription: "Meta description",
      keywords: "Keywords",
    },
    placeholders: {
      slug: "my-first-post",
      defaultLanguage: "en",
      authorName: "Admin",
      featuredImage: "https://example.com/cover.jpg",
      keywords: "saas,astro,go",
      slugFilter: "my-post",
      statusFilter: "draft / published / archived",
      languageFilter: "en / zh / ja",
    },
    confirm: {
      deletePost: "Delete this post?",
      deleteTranslation: "Delete current translation?",
    },
    preview: {
      title: "Rendered Preview",
      open: "Open Preview",
      close: "Close Preview",
    },
    actions: {
      edit: "Edit",
      delete: "Delete",
      refresh: "Refresh",
      clearCache: "Clear Cache",
    },
    media: {
      title: "Media",
      description: "Upload and pick blog media assets.",
      open: "Open Media Picker",
      upload: "Upload image",
      uploading: "Uploading...",
      loadMore: "Load more",
      empty: "No media files",
      loadFailed: "Failed to load media list",
      uploadFailed: "Failed to upload media",
      deleteFailed: "Failed to delete media",
    },
    pagination: {
      prev: "Prev",
      next: "Next",
    },
    loadingText: "Loading...",
  },
  zh: {
    title: "博客",
    section: "内容",
    description: "管理文章、翻译、发布状态与预览链接。",
    createAction: "创建文章",
    createTitle: "创建博客文章",
    editTitle: "编辑博客文章",
    createDescription: "先创建文章壳，再编辑多语言内容并发布。",
    editDescription: "管理元数据、多语言内容、发布状态与预览链接。",
    loadFailed: "加载博客列表失败",
    createFailed: "创建博客文章失败",
    updateFailed: "保存文章设置失败",
    saveTranslationFailed: "保存翻译失败",
    loadTranslationFailed: "加载翻译失败",
    deleteFailed: "删除失败",
    deleted: "已删除",
    deleting: "删除中...",
    cacheCleared: "博客缓存已清理",
    cacheClearFailed: "清理博客缓存失败",
    translationDeleted: "翻译已删除",
    deletingTranslation: "删除翻译中...",
    publish: "发布",
    unpublish: "下线",
    publishing: "发布中...",
    unpublishing: "下线中...",
    published: "已发布",
    unpublished: "已下线",
    previewLink: "创建预览链接",
    previewLinkFailed: "创建预览链接失败",
    previewLinkCreated: "预览链接已创建并复制",
    saveSettings: "保存设置",
    saveTranslation: "保存翻译",
    saving: "保存中...",
    saved: "已保存",
    backToList: "返回博客",
    noPosts: "暂无文章",
    noPostsDescription: "创建第一篇文章后即可发布。",
    applyFilters: "应用筛选",
    filters: {
      slug: "Slug",
      status: "状态",
      language: "语言",
    },
    table: {
      slug: "Slug",
      status: "状态",
      languages: "语言",
      publishedAt: "发布时间",
      actions: "操作",
    },
    status: {
      draft: "草稿",
      published: "已发布",
      archived: "已归档",
    },
    fields: {
      slug: "Slug",
      defaultLanguage: "默认语言",
      authorName: "作者名称",
      postStatus: "状态",
      featuredImage: "封面图 URL",
      adminNote: "管理备注",
      title: "标题",
      excerpt: "摘要",
      content: "内容（Markdown）",
      metaTitle: "Meta 标题",
      metaDescription: "Meta 描述",
      keywords: "关键词",
    },
    placeholders: {
      slug: "my-first-post",
      defaultLanguage: "en",
      authorName: "Admin",
      featuredImage: "https://example.com/cover.jpg",
      keywords: "saas,astro,go",
      slugFilter: "my-post",
      statusFilter: "草稿 / 已发布 / 已归档",
      languageFilter: "en / zh / ja",
    },
    confirm: {
      deletePost: "确认删除这篇文章？",
      deleteTranslation: "确认删除当前翻译？",
    },
    preview: {
      title: "渲染预览",
      open: "打开预览",
      close: "关闭预览",
    },
    actions: {
      edit: "编辑",
      delete: "删除",
      refresh: "刷新",
      clearCache: "清理缓存",
    },
    media: {
      title: "媒体",
      description: "上传并选择博客媒体资源。",
      open: "打开媒体选择器",
      upload: "上传图片",
      uploading: "上传中...",
      loadMore: "加载更多",
      empty: "暂无媒体文件",
      loadFailed: "加载媒体列表失败",
      uploadFailed: "上传媒体失败",
      deleteFailed: "删除媒体失败",
    },
    pagination: {
      prev: "上一页",
      next: "下一页",
    },
    loadingText: "加载中...",
  },
  ja: {
    title: "ブログ",
    section: "コンテンツ",
    description: "記事、翻訳、公開状態、プレビューリンクを管理します。",
    createAction: "記事を作成",
    createTitle: "ブログ記事を作成",
    editTitle: "ブログ記事を編集",
    createDescription: "先に記事を作成し、翻訳を編集して公開します。",
    editDescription: "メタデータ、翻訳、公開状態、プレビューリンクを管理します。",
    loadFailed: "ブログ一覧の読み込みに失敗しました",
    createFailed: "記事作成に失敗しました",
    updateFailed: "記事設定の保存に失敗しました",
    saveTranslationFailed: "翻訳の保存に失敗しました",
    loadTranslationFailed: "翻訳の読み込みに失敗しました",
    deleteFailed: "削除に失敗しました",
    deleted: "削除しました",
    deleting: "削除中...",
    cacheCleared: "ブログキャッシュをクリアしました",
    cacheClearFailed: "ブログキャッシュのクリアに失敗しました",
    translationDeleted: "翻訳を削除しました",
    deletingTranslation: "翻訳を削除中...",
    publish: "公開",
    unpublish: "非公開",
    publishing: "公開中...",
    unpublishing: "非公開中...",
    published: "公開済み",
    unpublished: "非公開",
    previewLink: "プレビューリンク作成",
    previewLinkFailed: "プレビューリンク作成に失敗しました",
    previewLinkCreated: "プレビューリンクを作成してコピーしました",
    saveSettings: "設定を保存",
    saveTranslation: "翻訳を保存",
    saving: "保存中...",
    saved: "保存しました",
    backToList: "ブログに戻る",
    noPosts: "記事がありません",
    noPostsDescription: "最初の記事を作成して公開できます。",
    applyFilters: "フィルター適用",
    filters: {
      slug: "Slug",
      status: "ステータス",
      language: "言語",
    },
    table: {
      slug: "Slug",
      status: "ステータス",
      languages: "言語",
      publishedAt: "公開日時",
      actions: "操作",
    },
    status: {
      draft: "下書き",
      published: "公開済み",
      archived: "アーカイブ",
    },
    fields: {
      slug: "Slug",
      defaultLanguage: "デフォルト言語",
      authorName: "著者名",
      postStatus: "ステータス",
      featuredImage: "アイキャッチ画像 URL",
      adminNote: "管理メモ",
      title: "タイトル",
      excerpt: "概要",
      content: "本文（Markdown）",
      metaTitle: "Meta タイトル",
      metaDescription: "Meta 説明",
      keywords: "キーワード",
    },
    placeholders: {
      slug: "my-first-post",
      defaultLanguage: "en",
      authorName: "Admin",
      featuredImage: "https://example.com/cover.jpg",
      keywords: "saas,astro,go",
      slugFilter: "my-post",
      statusFilter: "draft / published / archived",
      languageFilter: "en / zh / ja",
    },
    confirm: {
      deletePost: "この記事を削除しますか？",
      deleteTranslation: "現在の翻訳を削除しますか？",
    },
    preview: {
      title: "レンダリングプレビュー",
      open: "プレビューを開く",
      close: "プレビューを閉じる",
    },
    actions: {
      edit: "編集",
      delete: "削除",
      refresh: "更新",
      clearCache: "キャッシュ削除",
    },
    media: {
      title: "メディア",
      description: "ブログ用メディアをアップロードして選択します。",
      open: "メディアピッカーを開く",
      upload: "画像をアップロード",
      uploading: "アップロード中...",
      loadMore: "さらに読み込む",
      empty: "メディアファイルがありません",
      loadFailed: "メディア一覧の読み込みに失敗しました",
      uploadFailed: "メディアのアップロードに失敗しました",
      deleteFailed: "メディアの削除に失敗しました",
    },
    pagination: {
      prev: "前へ",
      next: "次へ",
    },
    loadingText: "読み込み中...",
  },
};

export function blogAdminT(locale: Locale): BlogAdminMessages {
  return messages[locale] ?? messages.en;
}
