package models

type BiometricEvidence struct {
	ID             string `json:"id" dynamodbav:"id"`
	ContractID     string `json:"contract_id" dynamodbav:"contract_id"`
	BiometricType  string `json:"biometric_type" dynamodbav:"biometric_type"`
	Hash           string `json:"hash" dynamodbav:"hash"`
	Verified       bool   `json:"verified" dynamodbav:"verified"`
	Timestamp      string `json:"timestamp" dynamodbav:"timestamp"`
}