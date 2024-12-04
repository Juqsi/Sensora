package response

import (
	"github.com/gofiber/fiber/v2"
)

const MSG_DEFAULT = "Probier es erneut"
const ERROR_TOKEN = "Error extract Bearer Token"
const MSG_NO_TOKEN = "Melde dich nochmal an und probier es noch einmal."
const MSG_NO_RETRY = "Du hast keine Zugriff oder das Item ist nicht verfügbar"
const MSG_RECOVERY = "Es ist ein unvorhergesehener Fehler aufgetreten."

type Response struct {
	Access  bool        `json:"access"`
	Msg     string      `json:"msg"`
	Error   []string    `json:"error"`
	Content interface{} `json:"content"`
	Ctx     *fiber.Ctx  `json:"-"`
}

func (response *Response) Send(HTTPCode int) {
	_ = response.Ctx.Status(HTTPCode).JSON(response)
}

func (r *Response) AddError(err string) {
	r.Error = append(r.Error, err)
}
