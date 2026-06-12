package handlers

import (
	"service-go/internal/services"

	"github.com/gofiber/fiber/v2"
)

type VerifyRequest struct {
	DocumentHash string `json:"document_hash"`
	Signature    string `json:"signature"`
}

func VerifyContract(c *fiber.Ctx) error {

	var body VerifyRequest

	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	err := services.VerifyContract(
		body.DocumentHash,
		body.Signature,
	)

	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"valid": false,
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"valid": true,
		"message": "contract verified",
	})
}

func VerifyContractByID(c *fiber.Ctx) error {

	id := c.Params("id")

	contract, err := services.GetContractByID(id)

	if err != nil {

		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	if contract == nil {

		return c.Status(404).JSON(fiber.Map{
			"error": "contract not found",
		})
	}

	err = services.VerifyContract(
		contract.DocumentHash,
		contract.DigitalSignature,
	)

	if err != nil {

		return c.JSON(fiber.Map{
			"valid": false,
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"contract_id": contract.ID,
		"status":      contract.Status,
		"valid":       true,
	})
}