package teams

import (
	"context"
	"testing"
)

func TestCreateTeamRequiresName(t *testing.T) {
	service := &Service{}
	if _, err := service.CreateTeam(context.Background(), "token", "   "); err == nil {
		t.Fatal("CreateTeam should fail when name is empty")
	}
}

func TestCreateInviteRequiresEmail(t *testing.T) {
	service := &Service{}
	if _, err := service.CreateInvite(context.Background(), "token", "team-1", " "); err == nil {
		t.Fatal("CreateInvite should fail when email is empty")
	}
}

func TestGetTeamRequiresTeamID(t *testing.T) {
	service := &Service{}
	if _, _, err := service.GetTeam(context.Background(), "token", ""); err == nil {
		t.Fatal("GetTeam should fail when team id is empty")
	}
}

func TestUpdateTeamRequiresName(t *testing.T) {
	service := &Service{}
	if _, err := service.UpdateTeam(context.Background(), "token", "team-1", " "); err == nil {
		t.Fatal("UpdateTeam should fail when name is empty")
	}
}

func TestRemoveMemberRequiresInput(t *testing.T) {
	service := &Service{}
	if err := service.RemoveMember(context.Background(), "token", "", "user-1"); err == nil {
		t.Fatal("RemoveMember should fail when team id is empty")
	}
}

func TestCreateTeamRoleRequiresInput(t *testing.T) {
	service := &Service{}
	if _, err := service.CreateTeamRole(context.Background(), "token", "", "custom", "Custom", "", nil); err == nil {
		t.Fatal("CreateTeamRole should fail when team id is empty")
	}
	if _, err := service.CreateTeamRole(context.Background(), "token", "team-1", "", "Custom", "", nil); err == nil {
		t.Fatal("CreateTeamRole should fail when role id is empty")
	}
}

func TestUpdateTeamRoleRequiresInput(t *testing.T) {
	service := &Service{}
	if _, err := service.UpdateTeamRole(context.Background(), "token", "team-1", "", "Custom", "", nil); err == nil {
		t.Fatal("UpdateTeamRole should fail when role id is empty")
	}
}

func TestDeleteTeamRoleRequiresInput(t *testing.T) {
	service := &Service{}
	if err := service.DeleteTeamRole(context.Background(), "token", "team-1", ""); err == nil {
		t.Fatal("DeleteTeamRole should fail when role id is empty")
	}
}
