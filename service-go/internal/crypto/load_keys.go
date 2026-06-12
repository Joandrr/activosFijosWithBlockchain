package crypto

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"errors"
	"os"
)

func LoadPrivateKey() (*rsa.PrivateKey, error) {

	data, err := os.ReadFile("keys/private.pem")

	if err != nil {
		return nil, err
	}

	block, _ := pem.Decode(data)

	if block == nil {
		return nil, errors.New("failed to decode private key")
	}

	privateKey, err := x509.ParsePKCS1PrivateKey(block.Bytes)

	if err != nil {
		return nil, err
	}

	return privateKey, nil
}

func LoadPublicKey() (*rsa.PublicKey, error) {

	data, err := os.ReadFile("keys/public.pem")

	if err != nil {
		return nil, err
	}

	block, _ := pem.Decode(data)

	if block == nil {
		return nil, errors.New("failed to decode public key")
	}

	publicInterface, err := x509.ParsePKIXPublicKey(block.Bytes)

	if err != nil {
		return nil, err
	}

	publicKey := publicInterface.(*rsa.PublicKey)

	return publicKey, nil
}