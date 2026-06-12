package repositories

import (
	"context"

	"service-go/internal/database"
	"service-go/internal/models"

	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

func CreateContract(contract models.Contract) error {

	item, err := attributevalue.MarshalMap(contract)

	if err != nil {
		return err
	}

	_, err = database.DynamoClient.PutItem(
		context.TODO(),
		&dynamodb.PutItemInput{
			TableName: awsString("contracts"),
			Item:      item,
		},
	)

	return err
}

func GetContracts() ([]models.Contract, error) {

	result, err := database.DynamoClient.Scan(
		context.TODO(),
		&dynamodb.ScanInput{
			TableName: awsString("contracts"),
		},
	)

	if err != nil {
		return nil, err
	}

	var contracts []models.Contract

	err = attributevalue.UnmarshalListOfMaps(
		result.Items,
		&contracts,
	)

	if err != nil {
		return nil, err
	}

	return contracts, nil
}

func awsString(s string) *string {
	return &s
}

//Obtener contrato por ID
func GetContractByID(id string) (*models.Contract, error) {

	result, err := database.DynamoClient.GetItem(
		context.TODO(),
		&dynamodb.GetItemInput{
			TableName: awsString("contracts"),
			Key: map[string]types.AttributeValue{
				"id": &types.AttributeValueMemberS{
					Value: id,
				},
			},
		},
	)

	if err != nil {
		return nil, err
	}

	if result.Item == nil {
		return nil, nil
	}

	var contract models.Contract

	err = attributevalue.UnmarshalMap(
		result.Item,
		&contract,
	)

	if err != nil {
		return nil, err
	}

	return &contract, nil
}

func UpdateContractStatus(
	contractID string,
	status string,
) error {

	_, err := database.DynamoClient.UpdateItem(
		context.TODO(),
		&dynamodb.UpdateItemInput{
			TableName: awsString("contracts"),

			Key: map[string]types.AttributeValue{
				"id": &types.AttributeValueMemberS{
					Value: contractID,
				},
			},

			UpdateExpression: awsString(
				"SET #status = :status",
			),

			ExpressionAttributeNames: map[string]string{
				"#status": "status",
			},

			ExpressionAttributeValues: map[string]types.AttributeValue{
				":status": &types.AttributeValueMemberS{
					Value: status,
				},
			},
		},
	)

	return err
}