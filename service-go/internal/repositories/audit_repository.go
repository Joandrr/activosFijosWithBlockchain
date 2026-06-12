package repositories

import (
	"context"

	"service-go/internal/database"
	"service-go/internal/models"

	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

func CreateAudit(audit models.Audit) error {

	item, err := attributevalue.MarshalMap(audit)

	if err != nil {
		return err
	}

	_, err = database.DynamoClient.PutItem(
		context.TODO(),
		&dynamodb.PutItemInput{
			TableName: awsString("audit_logs"),
			Item:      item,
		},
	)

	return err
}

func GetAuditLogs() ([]models.Audit, error) {

	result, err := database.DynamoClient.Scan(
		context.TODO(),
		&dynamodb.ScanInput{
			TableName: awsString("audit_logs"),
		},
	)

	if err != nil {
		return nil, err
	}

	var audits []models.Audit

	err = attributevalue.UnmarshalListOfMaps(
		result.Items,
		&audits,
	)

	if err != nil {
		return nil, err
	}

	return audits, nil
}

//Auditoria de la obtencion del contrato 
func GetAuditByContractID(contractID string) ([]models.Audit, error) {

	audits, err := GetAuditLogs()

	if err != nil {
		return nil, err
	}

	var result []models.Audit

	for _, audit := range audits {

		if audit.EntityID == contractID {
			result = append(result, audit)
		}
	}

	return result, nil
}
