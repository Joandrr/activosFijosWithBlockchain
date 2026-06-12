package services

import (
	"encoding/base64"
	"service-go/internal/audit"
	"service-go/internal/blockchain"
	"service-go/internal/constants"
	"service-go/internal/crypto"
	"service-go/internal/models"
	"service-go/internal/repositories"

	"github.com/google/uuid"
)

func CreateContract(title string, pdfBase64 string) (*models.Contract, error) {

	pdfBytes, err := base64.StdEncoding.DecodeString(pdfBase64)
	if err != nil {
		// Línea 34 corregida: se agrega 'nil,' antes del error
		return nil, err 
	}

	hash := blockchain.GenerateSHA256Bytes(pdfBytes)
	privateKey, err := crypto.LoadPrivateKey()
	if err != nil {
		// Línea 43 corregida: se agrega 'nil,' antes del error
		return nil, err 
	}

	signature, err := crypto.SignData(privateKey, hash)
	if err != nil {
		// Línea 65 corregida (aproximada según tu archivo original): se agrega 'nil,' antes del error
		return nil, err 
	}

	encodedSignature := blockchain.EncodeBase64(signature)

	contract := models.Contract{
		ID:               uuid.New().String(),
		Title:            title,
		DocumentHash:     hash,
		DigitalSignature: encodedSignature,
		Status:           constants.StatusPending,
	}

	err = audit.CreateAuditLog(
		"CREATE_CONTRACT",
		"contract",
		contract.ID,
		contract.DocumentHash,
		contract.DigitalSignature,
	)
	if err != nil {
		return nil, err
	}

	err = repositories.CreateContract(contract)
	if err != nil {
		return nil, err
	}

	return &contract, nil
}

func GetContracts() ([]models.Contract, error) {
	return repositories.GetContracts()
}

// Servicio para obtener el contrato por ID
func GetContractByID(id string) (*models.Contract, error) {
	return repositories.GetContractByID(id)
}