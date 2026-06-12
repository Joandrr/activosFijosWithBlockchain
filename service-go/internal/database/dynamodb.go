package database

//para produccion
/*
import (
	"context"
	"log"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

var DynamoClient *dynamodb.Client

func ConnectDynamoDB() {
	region := os.Getenv("AWS_REGION")
	if region == "" {
		log.Fatal("AWS_REGION está vacío. Ej: us-east-2")
	}

	cfg, err := config.LoadDefaultConfig(context.Background(), config.WithRegion(region))
	if err != nil {
		log.Fatalf("Error cargando config de AWS: %v", err)
	}

	DynamoClient = dynamodb.NewFromConfig(cfg)
	log.Printf("Intentando conectar a DynamoDB en región: %s", region)

	for i := 0; i < 5; i++ {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		_, err := DynamoClient.ListTables(ctx, &dynamodb.ListTablesInput{})
		cancel()

		if err == nil {
			log.Println("✅ CONECTADO EXITOSAMENTE A AWS DYNAMODB")
			return
		}

		log.Printf("⚠️ Intento %d: error DynamoDB ListTables: %T: %v", i+1, err, err)
		time.Sleep(3 * time.Second)
	}

	log.Fatal("❌ Error fatal: no se pudo conectar/listar tablas en DynamoDB (ver error arriba).")
}

*/
// para local

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

var DynamoClient *dynamodb.Client

func ConnectDynamoDB() {

	region := os.Getenv("AWS_REGION")
	endpoint := os.Getenv("DYNAMODB_ENDPOINT")

	cfg, err := config.LoadDefaultConfig(
		context.TODO(),
		config.WithRegion(region),
	)

	if err != nil {
		log.Fatal(err)
	}

	DynamoClient = dynamodb.NewFromConfig(
		cfg,
		func(o *dynamodb.Options) {
			o.BaseEndpoint = aws.String(endpoint)
		},
	)

	for i := 0; i < 10; i++ {

		_, err := DynamoClient.ListTables(
			context.TODO(),
			&dynamodb.ListTablesInput{},
		)

		if err == nil {
			log.Println("DynamoDB Connected")
			return
		}

		log.Println("Waiting for DynamoDB...")

		time.Sleep(3 * time.Second)
	}

	log.Fatal("Could not connect to DynamoDB")
}