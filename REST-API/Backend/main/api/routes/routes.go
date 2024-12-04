package routes

import (
	"REST-API/main/api/middleware"
	"fmt"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/monitor"
	"github.com/gofiber/fiber/v2/middleware/requestid"
)

func SetupRoutes() {
	var app = fiber.New(fiber.Config{
		BodyLimit: 5 * 1024 * 1024, // MB
	})
	app.Use(cors.New())

	app.Use(requestid.New())

	//Middleware
	app.Get("/monitor", monitor.New(monitor.Config{Title: "SVHub"}))
	middleware.Logging(app)
	app.Use(middleware.Recovery)
	app.Use(middleware.ResponseBuilder)

	//TODO add here routes without authentication like login or register

	//all functions below needs an authentication e.g. JWT
	app.Use(middleware.Authentication)

	//manage POST-Request
	app.Post("/pfad")

	//manage GET-Request
	//Example with parameter
	app.Get("/pfad/:para")

	fmt.Println("▶️ start server")
	err := app.Listen(":3000")
	if err != nil {
		fmt.Println("❌ cant Start Server probably port 3000 in use")
		panic(err)
	}
}
