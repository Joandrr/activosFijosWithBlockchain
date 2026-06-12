package repositories

import (
	"context"

	"service-go/internal/database"
	"service-go/internal/models"

	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

func CreateBiometricEvidence(
	evidence models.BiometricEvidence,
) error {

	item, err := attributevalue.MarshalMap(evidence)

	if err != nil {
		return err
	}

	_, err = database.DynamoClient.PutItem(
		context.TODO(),
		&dynamodb.PutItemInput{
			TableName: awsString("biometric_evidence"),
			Item:      item,
		},
	)

	return err
}

func GetBiometricsByContractID(
	contractID string,
) ([]models.BiometricEvidence, error) {

	result, err := database.DynamoClient.Scan(
		context.TODO(),
		&dynamodb.ScanInput{
			TableName: awsString("biometric_evidence"),
		},
	)

	if err != nil {
		return nil, err
	}

	var biometrics []models.BiometricEvidence

	err = attributevalue.UnmarshalListOfMaps(
		result.Items,
		&biometrics,
	)

	if err != nil {
		return nil, err
	}

	var filtered []models.BiometricEvidence

	for _, biometric := range biometrics {

		if biometric.ContractID == contractID {
			filtered = append(filtered, biometric)
		}
	}

	return filtered, nil
}