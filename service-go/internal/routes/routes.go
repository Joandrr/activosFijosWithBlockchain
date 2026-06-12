package routes

import (
	"service-go/internal/handlers"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {

	app.Get("/", handlers.RootHandler)
	
	app.Post("/contracts", handlers.CreateContract)
	app.Get("/contracts", handlers.GetContracts)
	app.Get("/contracts/:id", handlers.GetContract)

	app.Post("/contracts/verify", handlers.VerifyContract)
	app.Get("/contracts/:id/verify", handlers.VerifyContractByID)

	app.Post("/contracts/:id/sign", handlers.SignContract)
	app.Get("/contracts/:id/signatures", handlers.GetContractSignatures)

	app.Get("/audit-logs", handlers.GetAuditLogs)
	app.Get("/contracts/:id/audit", handlers.GetContractAudit)

	app.Post("/contracts/:id/biometric", handlers.RegisterBiometric)
	app.Get("/contracts/:id/biometrics", handlers.GetContractBiometrics)
}