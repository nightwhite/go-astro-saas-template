package pagination

import (
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type Query struct {
	Params
	SortBy    string            `json:"sort_by"`
	SortOrder string            `json:"sort_order"`
	Cursor    string            `json:"cursor,omitempty"`
	Filters   map[string]string `json:"filters,omitempty"`
}

func FromRequest(c *gin.Context) Query {
	page, _ := strconv.Atoi(c.DefaultQuery("page", strconv.Itoa(DefaultPage)))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", strconv.Itoa(DefaultPageSize)))
	params := Normalize(page, pageSize)

	sortBy := strings.TrimSpace(c.Query("sort_by"))
	sortOrder := strings.ToLower(strings.TrimSpace(c.DefaultQuery("sort_order", "desc")))
	cursor := strings.TrimSpace(c.Query("cursor"))
	if sortOrder != "asc" {
		sortOrder = "desc"
	}

	filters := map[string]string{}
	for key, values := range c.Request.URL.Query() {
		if !strings.HasPrefix(key, "filter_") || len(values) == 0 {
			continue
		}
		value := strings.TrimSpace(values[0])
		if value == "" {
			continue
		}
		filters[strings.TrimPrefix(key, "filter_")] = value
	}

	return Query{
		Params:    params,
		SortBy:    sortBy,
		SortOrder: sortOrder,
		Cursor:    cursor,
		Filters:   filters,
	}
}

func (q Query) Offset() int {
	return (q.Page - 1) * q.PageSize
}

func ResolveSort(requested string, allowed map[string]string, fallback string) string {
	if requested == "" {
		return fallback
	}
	if resolved, ok := allowed[requested]; ok {
		return resolved
	}
	return fallback
}

func ResolveFilter(query Query, allowed map[string]string) map[string]string {
	if len(query.Filters) == 0 {
		return nil
	}

	resolved := make(map[string]string, len(query.Filters))
	for key, value := range query.Filters {
		if alias, ok := allowed[key]; ok && value != "" {
			resolved[alias] = value
		}
	}

	if len(resolved) == 0 {
		return nil
	}
	return resolved
}
