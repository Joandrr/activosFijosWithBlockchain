package audit

import (
	"time"

	"service-go/internal/models"
	"service-go/internal/repositories"

	"github.com/google/uuid"
)

func CreateAuditLog(
	action string,
	entity string,
	entityID string,
	hash string,
	signature string,
) error {

	audit := models.Audit{
		ID:        uuid.New().String(),
		Action:    action,
		Entity:    entity,
		EntityID:  entityID,
		Hash:      hash,
		Signature: signature,
		Timestamp: time.Now().Format(time.RFC3339),
	}

	return repositories.CreateAudit(audit)
}

func GetAuditLogs() ([]models.Audit, error) {
	return repositories.GetAuditLogs()
}

func GetAuditByContractID(contractID string) ([]models.Audit, error) {
	return repositories.GetAuditByContractID(contractID)
}