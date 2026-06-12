package models

type Audit struct {
	ID         string `json:"id" dynamodbav:"id"`
	Action     string `json:"action" dynamodbav:"action"`
	Entity     string `json:"entity" dynamodbav:"entity"`
	EntityID   string `json:"entity_id" dynamodbav:"entity_id"`
	Hash       string `json:"hash" dynamodbav:"hash"`
	Signature  string `json:"signature" dynamodbav:"signature"`
	Timestamp  string `json:"timestamp" dynamodbav:"timestamp"`
}