package handlers

import (
	"service-go/internal/audit"
	"service-go/internal/services"

	"github.com/gofiber/fiber/v2"
)

type SignRequest struct {
    SignerType   string `json:"signer_type"`
    DocumentHash string `json:"document_hash"`
    SignatureUrl string `json:"signature_url"`
}
// FLUJO REAL
// Contrato
//    ↓
// Firmante envía request
//    ↓
// Sistema firma hash
//    ↓
// Guardar firma individual
//    ↓
// Guardar audit trail


func SignContract(c *fiber.Ctx) error {

	contractID := c.Params("id")

	var body SignRequest

	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	err := services.SignContract(
		contractID,
		body.SignerType,
		body.DocumentHash,
		body.SignatureUrl,
	)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	err = audit.CreateAuditLog(
		"SIGN_CONTRACT",
		"contract_signature",
		contractID,
		body.DocumentHash,
		body.SignerType,
	)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "contract signed",
	})
}

func GetContractSignatures(c *fiber.Ctx) error {

	contractID := c.Params("id")

	signatures, err := services.GetContractSignatures(contractID)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(signatures)
}