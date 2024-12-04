package middleware

import (
	"REST-API/main/api/authentication"
	"REST-API/main/api/response"
	"REST-API/main/database"
	"encoding/base64"
	"encoding/json"
	"github.com/gofiber/fiber/v2"
	"os/user"
	"strings"
)

func Authentication(ctx *fiber.Ctx) error {

	//response erstellen
	ctx.Locals("response", response.Response{
		true,
		"",
		[]string{},
		nil,
		ctx,
	})
	response := ctx.Locals("response").(response.Response)
	userToken := ctx.Get("Authorization", "")

	//TODO change for your infrastructure
	//Example: Bearer Token in own Database with
	if userToken == "" {
		response.Access = false
		response.Msg = "Melde dich erneut an"
		response.AddError("Authorization header is missing")
		response.Send(fiber.StatusUnauthorized)
		return nil
	}
	tmp := strings.SplitAfter(userToken, "Bearer ")
	if len(tmp) != 2 {
		response.Access = false
		response.Msg = "Melde dich erneut an"
		response.AddError("Token has false format")
		response.Send(fiber.StatusUnauthorized)
		return nil
	}
	userToken = tmp[1]

	token, err := authentication.ValidateJWT(userToken)
	if err != nil {
		response.Access = false
		response.AddError(err.Error())
		response.Send(fiber.StatusUnauthorized)
		return nil
	}

	parts := strings.Split(userToken, ".")
	if len(parts) != 3 {
		response.Access = false
		response.AddError("Token has false format")
		response.Send(fiber.StatusUnauthorized)
		return nil
	}

	// Payload auslesen und base64-dekodieren
	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		response.Access = false
		response.AddError(err.Error())
		response.Send(fiber.StatusUnauthorized)
		return nil
	}

	// Optional: Payload in eine Map konvertieren
	var payloadData map[string]interface{}
	if err := json.Unmarshal(payload, &payloadData); err != nil {
		response.Access = false
		response.AddError(err.Error())
		response.Send(fiber.StatusUnauthorized)
		return nil
	}

	if payloadData["id"] == "" {
		response.Access = false
		response.AddError("Token ID is missing")
		response.Send(fiber.StatusUnauthorized)
		return nil
	}

	ctx.Locals("token", *token)
	//TODO chnage for your Database
	users, count, err := database.Select[user.User]("SELECT * FROM users WHERE id=?;", payloadData["id"])
	if err != nil {
		response.Access = false
		response.AddError(err.Error())
		response.Send(fiber.StatusUnauthorized)
		return nil
	}

	if count != 1 {
		response.Access = false
		response.AddError("User not found")
		response.Send(fiber.StatusUnauthorized)
	}

	ctx.Locals("user", users[0])

	return ctx.Next()
}
