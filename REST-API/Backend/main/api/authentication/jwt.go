package authentication

import (
	"REST-API/main/utils"
	"fmt"
	"github.com/golang-jwt/jwt/v5"
	"time"
)

var jwtSecret = []byte(utils.GetEnv("JWT_SECRET", "secret"))

type Claims struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Id       string `json:"id"`
	jwt.RegisteredClaims
}

// TODO change any to user struct
func GenerateJWT(user any) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)

	claims := &Claims{
		//TODO add fields for user infos in token
		//Username: user.Username,
		//Id:       user.Id,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func ValidateJWT(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("ungültiges Token")
	}

	return claims, nil
}
