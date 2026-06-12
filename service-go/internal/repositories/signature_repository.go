package repositories

import (
	"context"

	"service-go/internal/database"
	"service-go/internal/models"

	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

func CreateSignature(signature models.Signature) error {

	item, err := attributevalue.MarshalMap(signature)

	if err != nil {
		return err
	}

	_, err = database.DynamoClient.PutItem(
		context.TODO(),
		&dynamodb.PutItemInput{
			TableName: awsString("contract_signatures"),
			Item:      item,
		},
	)

	return err
}

func GetSignaturesByContractID(
	contractID string,
) ([]models.Signature, error) {

	result, err := database.DynamoClient.Scan(
		context.TODO(),
		&dynamodb.ScanInput{
			TableName: awsString("contract_signatures"),
		},
	)

	if err != nil {
		return nil, err
	}

	var signatures []models.Signature

	err = attributevalue.UnmarshalListOfMaps(
		result.Items,
		&signatures,
	)

	if err != nil {
		return nil, err
	}

	var filtered []models.Signature

	for _, signature := range signatures {

		if signature.ContractID == contractID {
			filtered = append(filtered, signature)
		}
	}

	return filtered, nil
}