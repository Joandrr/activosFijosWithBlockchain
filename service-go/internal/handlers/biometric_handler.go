package handlers

import (
	"service-go/internal/audit"
	"service-go/internal/services"

	"github.com/gofiber/fiber/v2"
)

type BiometricRequest struct {
	BiometricType string `json:"biometric_type"`
	Hash          string `json:"hash"`
}

func RegisterBiometric(c *fiber.Ctx) error {

	contractID := c.Params("id")

	var body BiometricRequest

	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	err := services.RegisterBiometricEvidence(
		contractID,
		body.BiometricType,
		body.Hash,
	)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	err = audit.CreateAuditLog(
		"REGISTER_BIOMETRIC",
		"biometric_evidence",
		contractID,
		body.Hash,
		body.BiometricType,
	)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "biometric evidence registered",
	})
}

func GetContractBiometrics(c *fiber.Ctx) error {

	contractID := c.Params("id")

	biometrics, err := services.GetBiometricsByContractID(contractID)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(biometrics)
}