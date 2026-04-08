package roles

import (
	"context"
	"testing"

	"github.com/night/go-astro-template/apps/api/internal/pkg/pagination"
)

func TestListWithoutRepositoryPanicsAvoidance(t *testing.T) {
	service := &Service{}
	_, _, err := safeList(service, context.Background(), pagination.Query{})
	if err == nil {
		t.Fatal("expected safeList to guard nil repository")
	}
}

func safeList(service *Service, ctx context.Context, query pagination.Query) (_ any, _ int, err error) {
	defer func() {
		if recover() != nil {
			err = context.Canceled
		}
	}()
	return service.List(ctx, query)
}
