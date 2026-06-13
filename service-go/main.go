package main

import (
	"log"
	"os"

	"service-go/internal/crypto"
	"service-go/internal/database"
	"service-go/internal/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {

	_, err := os.Stat("keys/private.pem")

	if os.IsNotExist(err) {

		privateKey, publicKey, err := crypto.GenerateKeys()

		if err != nil {
			log.Fatal(err)
		}

		err = crypto.SavePrivateKey(privateKey)

		if err != nil {
			log.Fatal(err)
		}

		err = crypto.SavePublicKey(publicKey)

		if err != nil {
			log.Fatal(err)
		}

		log.Println("RSA keys generated")
	}

	database.ConnectDynamoDB()

	//Todo eso local
	database.CreateContractsTable()

	database.CreateAuditTable()

	database.CreateSignaturesTable()

	//database.CreateBiometricTable()


	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	routes.SetupRoutes(app)

	log.Fatal(app.Listen(":3000"))
}