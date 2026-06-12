package crypto

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"os"
)

func SavePrivateKey(privateKey *rsa.PrivateKey) error {

	privateBytes := x509.MarshalPKCS1PrivateKey(privateKey)

	privateBlock := &pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: privateBytes,
	}

	file, err := os.Create("keys/private.pem")

	if err != nil {
		return err
	}

	defer file.Close()

	return pem.Encode(file, privateBlock)
}

func SavePublicKey(publicKey *rsa.PublicKey) error {

	publicBytes, err := x509.MarshalPKIXPublicKey(publicKey)

	if err != nil {
		return err
	}

	publicBlock := &pem.Block{
		Type:  "PUBLIC KEY",
		Bytes: publicBytes,
	}

	file, err := os.Create("keys/public.pem")

	if err != nil {
		return err
	}

	defer file.Close()

	return pem.Encode(file, publicBlock)
}