package crypto

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
)

func SignData(privateKey *rsa.PrivateKey, data string) ([]byte, error) {

	hash := sha256.Sum256([]byte(data))

	signature, err := rsa.SignPKCS1v15(
		rand.Reader,
		privateKey,
		crypto.SHA256,
		hash[:],
	)

	if err != nil {
		return nil, err
	}

	return signature, nil
}