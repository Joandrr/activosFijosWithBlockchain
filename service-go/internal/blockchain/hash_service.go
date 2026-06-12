package blockchain

import (
	"crypto/sha256"
	"encoding/hex"
)

func GenerateSHA256(data string) string {
	hash := sha256.Sum256([]byte(data))

	return hex.EncodeToString(hash[:])
}

func GenerateSHA256Bytes(
    data []byte,
) string {

    hash :=
        sha256.Sum256(data)

    return hex.EncodeToString(
        hash[:],
    )
}