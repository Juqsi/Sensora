package authentication

import (
	"bytes"
	"crypto/rand"
	"errors"
	"fmt"
	"golang.org/x/crypto/pbkdf2"
	"golang.org/x/crypto/sha3"
)

type PBKDF2Hash struct {
	KeyLen  int
	SaltLen int
}

type HashSalt struct {
	Hash []byte `db:"password"`
	Salt []byte `db:"salt"`
}

func (p *PBKDF2Hash) GenerateHash(password, salt []byte) (*HashSalt, error) {
	var err error
	if len(salt) == 0 {
		salt, err = randomSecret(uint32(p.SaltLen))
	}
	if err != nil {
		return nil, err
	}
	fmt.Println("password")
	fmt.Println(password)
	hash := pbkdf2.Key(password, salt, 5, p.KeyLen, sha3.New256)
	return &HashSalt{Hash: hash, Salt: salt}, nil
}

func (p *PBKDF2Hash) Compare(hash, salt, password []byte) error {
	hashSalt, err := p.GenerateHash(password, salt)
	if err != nil {
		return err
	}
	if !bytes.Equal(hash, hashSalt.Hash) {
		return errors.New("hash doesn't match")
	}
	return nil
}

func randomSecret(length uint32) ([]byte, error) {
	secret := make([]byte, length)

	_, err := rand.Read(secret)
	if err != nil {
		return nil, err
	}

	return secret, nil
}
