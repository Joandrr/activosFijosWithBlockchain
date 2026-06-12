package handlers

import (
	"service-go/internal/audit"

	"github.com/gofiber/fiber/v2"
)

func GetAuditLogs(c *fiber.Ctx) error {

	audits, err := audit.GetAuditLogs()

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(audits)
}

func GetContractAudit(c *fiber.Ctx) error {

	contractID := c.Params("id")

	audits, err := audit.GetAuditByContractID(contractID)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(audits)
}