## EXAMPLE CREATE ##
cd blockchain-service //new project
Ejecuta:

## go mod init blockchain-service ##

Esto crea:

## go.mod ##

Instalar Fiber

Usaremos:

## Fiber ##

Instala:

## go get github.com/gofiber/fiber/v2 ##

## EJECUTION ##

## go run main.go ##


## Comienzo de dockerizar ##

Crear imagen:
## docker build -t service-go . ##

## Levantar contenedor ##

Ejecuta:

## docker run -p 3000:3000 service-go ##

## LEVANTAR EL COMPOSE ##

## docker compose up --build ##