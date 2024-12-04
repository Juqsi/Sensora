package middleware

import (
	"REST-API/main/api/response"
	"fmt"
	"github.com/gofiber/fiber/v2"
	"runtime/debug"
)

func Recovery(ctx *fiber.Ctx) error {
	response := response.Response{
		Ctx:     ctx,
		Access:  true,
		Error:   []string{},
		Content: nil,
		Msg:     response.MSG_RECOVERY,
	}

	defer func() {
		if r := recover(); r != nil {
			var err error
			if e, ok := r.(error); ok {
				err = e
			} else {
				err = fmt.Errorf("%v", r)
			}
			response.AddError("Panic: Recovery Done")
			response.AddError(err.Error())
			fmt.Println("stacktrace from panic: \n" + string(debug.Stack()))
			response.Send(fiber.StatusInternalServerError)
		}
	}()
	return ctx.Next()
}
