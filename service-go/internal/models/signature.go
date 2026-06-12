package models

//representa un firma individual
type Signature struct {
	ID           string `json:"id" dynamodbav:"id"`
	ContractID   string `json:"contract_id" dynamodbav:"contract_id"`
	SignerType   string `json:"signer_type" dynamodbav:"signer_type"`
	Hash         string `json:"hash" dynamodbav:"hash"`
	Signature    string `json:"signature" dynamodbav:"signature"`
	SignatureUrl string `json:"signature_url" dynamodbav:"signature_url"`
	Timestamp    string `json:"timestamp" dynamodbav:"timestamp"`
}