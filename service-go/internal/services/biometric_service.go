package services

import (
	"time"

	"service-go/internal/models"
	"service-go/internal/repositories"

	"github.com/google/uuid"
)

func RegisterBiometricEvidence(
	contractID string,
	biometricType string,
	hash string,
) error {

	evidence := models.BiometricEvidence{
		ID:            uuid.New().String(),
		ContractID:    contractID,
		BiometricType: biometricType,
		Hash:          hash,
		Verified:      true,
		Timestamp:     time.Now().Format(time.RFC3339),
	}

	return repositories.CreateBiometricEvidence(evidence)
}

func GetBiometricsByContractID(
	contractID string,
) ([]models.BiometricEvidence, error) {

	return repositories.GetBiometricsByContractID(contractID)
}