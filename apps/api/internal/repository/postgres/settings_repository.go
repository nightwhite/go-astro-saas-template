package postgres

import (
	"context"
	"encoding/json"

	dbent "github.com/night/go-astro-template/apps/api/ent"
	entsystemsetting "github.com/night/go-astro-template/apps/api/ent/systemsetting"
)

type SettingsRepository struct {
	client *Client
	ent    *dbent.Client
}

func NewSettingsRepository(client *Client) *SettingsRepository {
	return &SettingsRepository{
		client: client,
		ent:    client.Ent,
	}
}

func (r *SettingsRepository) Client() *Client {
	return r.client
}

func (r *SettingsRepository) Upsert(ctx context.Context, tenantID, category, key string, value any) error {
	payload, err := json.Marshal(value)
	if err != nil {
		return err
	}

	mappedValue := map[string]any{}
	if err := json.Unmarshal(payload, &mappedValue); err != nil {
		return err
	}

	existing, err := r.ent.SystemSetting.Query().
		Where(
			entsystemsetting.TenantID(tenantID),
			entsystemsetting.Category(category),
			entsystemsetting.Key(key),
		).
		Only(ctx)
	if err == nil && existing != nil {
		_, err = r.ent.SystemSetting.UpdateOneID(existing.ID).
			SetValue(mappedValue).
			Save(ctx)
		return err
	}
	if err != nil && !dbent.IsNotFound(err) {
		return err
	}

	_, err = r.ent.SystemSetting.Create().
		SetTenantID(tenantID).
		SetCategory(category).
		SetKey(key).
		SetValue(mappedValue).
		Save(ctx)
	return err
}

func (r *SettingsRepository) GetAll(ctx context.Context, tenantID string) (map[string]any, error) {
	rows, err := r.ent.SystemSetting.Query().
		Where(entsystemsetting.TenantID(tenantID)).
		Order(
			dbent.Asc(entsystemsetting.FieldCategory),
			dbent.Asc(entsystemsetting.FieldKey),
		).
		All(ctx)
	if err != nil {
		return nil, err
	}

	result := map[string]any{}
	for _, row := range rows {
		if _, ok := result[row.Category]; !ok {
			result[row.Category] = map[string]any{}
		}
		result[row.Category].(map[string]any)[row.Key] = row.Value
	}

	return result, nil
}

func (r *SettingsRepository) GetValue(ctx context.Context, tenantID, category, key string) (map[string]any, error) {
	record, err := r.ent.SystemSetting.Query().
		Where(
			entsystemsetting.TenantID(tenantID),
			entsystemsetting.Category(category),
			entsystemsetting.Key(key),
		).
		Only(ctx)
	if dbent.IsNotFound(err) {
		return map[string]any{}, nil
	}
	if err != nil {
		return nil, err
	}
	return record.Value, nil
}
