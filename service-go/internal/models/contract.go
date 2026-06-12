package models

type Contract struct {
	ID              string `json:"id" dynamodbav:"id"`
	Title           string `json:"title" dynamodbav:"title"`
	DocumentHash    string `json:"document_hash" dynamodbav:"document_hash"`
	DigitalSignature string `json:"digital_signature" dynamodbav:"digital_signature"`
	Status string `json:"status" dynamodbav:"status"`
}