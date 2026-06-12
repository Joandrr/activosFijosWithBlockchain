package crypto

import (
	"crypto"
	"crypto/rsa"
	"crypto/sha256"
)

func VerifySignature(
	publicKey *rsa.PublicKey,
	data string,
	signature []byte,
) error {

	hash := sha256.Sum256([]byte(data))

	return rsa.VerifyPKCS1v15(
		publicKey,
		crypto.SHA256,
		hash[:],
		signature,
	)
}