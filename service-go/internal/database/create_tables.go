package database

import (
	"context"
	"log"

	"github.com/aws/aws-sdk-go-v2/service/dynamodb"

	dynamodbtypes "github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

func CreateContractsTable() {

	_, err := DynamoClient.CreateTable(
		context.TODO(),
		&dynamodb.CreateTableInput{
			TableName: awsString("contracts"),

			AttributeDefinitions: []dynamodbtypes.AttributeDefinition{
				{
					AttributeName: awsString("id"),
					AttributeType: dynamodbtypes.ScalarAttributeTypeS,
				},
			},

			KeySchema: []dynamodbtypes.KeySchemaElement{
				{
					AttributeName: awsString("id"),
					KeyType:       dynamodbtypes.KeyTypeHash,
				},
			},

			BillingMode: dynamodbtypes.BillingModePayPerRequest,
		},
	)

	if err != nil {
		log.Println(err)
		return
	}

	log.Println("contracts table created")
}

func awsString(s string) *string {
	return &s
}

func CreateAuditTable() {

	_, err := DynamoClient.CreateTable(
		context.TODO(),
		&dynamodb.CreateTableInput{
			TableName: awsString("audit_logs"),

			AttributeDefinitions: []dynamodbtypes.AttributeDefinition{
				{
					AttributeName: awsString("id"),
					AttributeType: dynamodbtypes.ScalarAttributeTypeS,
				},
			},

			KeySchema: []dynamodbtypes.KeySchemaElement{
				{
					AttributeName: awsString("id"),
					KeyType:       dynamodbtypes.KeyTypeHash,
				},
			},

			BillingMode: dynamodbtypes.BillingModePayPerRequest,
		},
	)

	if err != nil {
		log.Println(err)
		return
	}

	log.Println("audit_logs table created")
}

func CreateSignaturesTable() {

	_, err := DynamoClient.CreateTable(
		context.TODO(),
		&dynamodb.CreateTableInput{
			TableName: awsString("contract_signatures"),

			AttributeDefinitions: []dynamodbtypes.AttributeDefinition{
				{
					AttributeName: awsString("id"),
					AttributeType: dynamodbtypes.ScalarAttributeTypeS,
				},
			},

			KeySchema: []dynamodbtypes.KeySchemaElement{
				{
					AttributeName: awsString("id"),
					KeyType:       dynamodbtypes.KeyTypeHash,
				},
			},

			BillingMode: dynamodbtypes.BillingModePayPerRequest,
		},
	)

	if err != nil {
		log.Println(err)
		return
	}

	log.Println("contract_signatures table created")
}

//tabla para la biometrica
func CreateBiometricTable() {

	_, err := DynamoClient.CreateTable(
		context.TODO(),
		&dynamodb.CreateTableInput{
			TableName: awsString("biometric_evidence"),

			AttributeDefinitions: []dynamodbtypes.AttributeDefinition{
				{
					AttributeName: awsString("id"),
					AttributeType: dynamodbtypes.ScalarAttributeTypeS,
				},
			},

			KeySchema: []dynamodbtypes.KeySchemaElement{
				{
					AttributeName: awsString("id"),
					KeyType:       dynamodbtypes.KeyTypeHash,
				},
			},

			BillingMode: dynamodbtypes.BillingModePayPerRequest,
		},
	)

	if err != nil {
		log.Println(err)
		return
	}

	log.Println("biometric_evidence table created")
}