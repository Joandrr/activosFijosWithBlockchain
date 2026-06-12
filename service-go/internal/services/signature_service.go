package services

import (
	"time"

	"service-go/internal/blockchain"
	"service-go/internal/constants"
	"service-go/internal/crypto"
	"service-go/internal/models"
	"service-go/internal/repositories"

	"github.com/google/uuid"
)

func SignContract(
    contractID string,
    signerType string,
    documentHash string,
    signatureUrl string,
) error {

	privateKey, err := crypto.LoadPrivateKey()

	if err != nil {
		return err
	}

	signatureBytes, err := crypto.SignData(
		privateKey,
		documentHash,
	)

	if err != nil {
		return err
	}

	signature := models.Signature{
		ID:         uuid.New().String(),
		ContractID: contractID,
		SignerType: signerType,
		Hash:       documentHash,
		Signature:  blockchain.EncodeBase64(signatureBytes),
		SignatureUrl: signatureUrl,
		Timestamp:  time.Now().Format(time.RFC3339),
	}

	// Guardar firma
	err = repositories.CreateSignature(signature)

	if err != nil {
		return err
	}

	// Obtener cantidad de firmas
	signatures, err := repositories.GetSignaturesByContractID(contractID)

	if err != nil {
		return err
	}

	// Actualizar estado
	if len(signatures) >= 2 {

		err = repositories.UpdateContractStatus(
			contractID,
			constants.StatusFullySigned,
		)

	} else {

		err = repositories.UpdateContractStatus(
			contractID,
			constants.StatusPartiallySigned,
		)
	}

	if err != nil {
		return err
	}

	return nil
}

func GetContractSignatures(
	contractID string,
) ([]models.Signature, error) {

	return repositories.GetSignaturesByContractID(contractID)
}