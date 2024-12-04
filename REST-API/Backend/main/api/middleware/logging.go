package middleware

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"log"
	"os"
)

func Logging(app *fiber.App) {
	app.Use(logger.New(logger.Config{
		Format:     "${time} -- ${status} -- ${method} ${path} ${queryParams} ${latency} \n",
		TimeFormat: "2006-01-02 15:04:05.00000",
	}))
	file, err := os.OpenFile("./Logfile.log", os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	if err != nil {
		log.Fatalf("error opening file: %v", err)
	}
	app.Use(logger.New(logger.Config{
		Output:     file,
		Format:     "${time} -- ${status} -- ${method} ${path} ${queryParams} ${latency} \n",
		TimeFormat: "2006-01-02 15:04:05.00000",
	}))
}
