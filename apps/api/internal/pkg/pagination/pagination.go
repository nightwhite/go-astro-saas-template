package pagination

const (
	DefaultPage     = 1
	DefaultPageSize = 20
	MaxPageSize     = 100
)

type Params struct {
	Page     int `json:"page"`
	PageSize int `json:"page_size"`
}

type Meta struct {
	Page     int `json:"page"`
	PageSize int `json:"page_size"`
	Total    int `json:"total"`
}

func Normalize(page, pageSize int) Params {
	if page < 1 {
		page = DefaultPage
	}
	if pageSize < 1 {
		pageSize = DefaultPageSize
	}
	if pageSize > MaxPageSize {
		pageSize = MaxPageSize
	}

	return Params{
		Page:     page,
		PageSize: pageSize,
	}
}

func NewMeta(page, pageSize, total int) Meta {
	params := Normalize(page, pageSize)
	return Meta{
		Page:     params.Page,
		PageSize: params.PageSize,
		Total:    total,
	}
}
