package services

import (
	"service-go/internal/blockchain"
	"service-go/internal/crypto"
)

func VerifyContract(
	documentHash string,
	signature string,
) error {

	publicKey, err := crypto.LoadPublicKey()

	if err != nil {
		return err
	}

	decodedSignature, err := blockchain.DecodeBase64(signature)

	if err != nil {
		return err
	}

	return crypto.VerifySignature(
		publicKey,
		documentHash,
		decodedSignature,
	)
}

