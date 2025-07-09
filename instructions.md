# Instrucciones para correr el proyecto

Este proyecto es un backend que expone dos APIs principales para la generación y procesamiento de archivos. A continuación encontrarás los pasos necesarios para levantar el entorno, probar las APIs y una descripción de las funcionalidades principales.

---

## Requisitos previos

- Tener instalado [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/)
- (Opcional) Tener instalado [pnpm](https://pnpm.io/) si deseas correr scripts o tests localmente

---

## Levantar el entorno con Docker Compose

El proyecto incluye un archivo `docker-compose.yml` que facilita el despliegue de todos los servicios necesarios.

### Para usuarios de Mac con chip M1 o superior (Apple Silicon)

No necesitas hacer ningún cambio. Simplemente ejecuta:

```bash
docker compose up --build
```

Esto levantará:

- Una base de datos SQL Server compatible (Azure SQL Edge)
- El backend Node.js

### Para otros sistemas (Windows, Linux, Mac Intel)

1. Abre el archivo `docker-compose.yml`.
2. Descomenta la sección de `sqlserver` (líneas marcadas como "SQL Server for Linux/Windows") y comenta la sección de `sqledge`.
3. Guarda los cambios.
4. Ejecuta:

```bash
docker compose up --build
```

---

## Endpoints disponibles

El backend expone dos endpoints principales:

### 1. Procesar archivo

- **Endpoint:** `POST http://localhost:8001/api/v1/start-processing`
- **Descripción:** Procesa un archivo previamente generado y realiza las operaciones necesarias.

### 2. Generar archivo

- **Endpoint:** `POST http://localhost:8001/api/v1/generate-file`
- **Descripción:** Genera un archivo de prueba con el tamaño y tasa de error especificados.
- **Body (JSON):**

```json
{
  "size": "5kb", // Soporta kb, mb, gb, etc.
  "errorRate": 0.2 // Tasa de error (por ejemplo, 0.2 = 20%)
}
```

---

## Probar los endpoints

Puedes utilizar herramientas como [Postman](https://www.postman.com/) o [curl](https://curl.se/) para probar los endpoints. Ejemplo con curl para generar un archivo:

```bash
curl -X POST http://localhost:8001/api/v1/generate-file \
  -H "Content-Type: application/json" \
  -d '{"size": "5mb", "errorRate": 0.1}'
```

---

## Features principales

- **Generación de archivos de prueba** con tamaño y tasa de error configurables.
- **API RESTful** documentada y fácil de consumir.
- **Soporte para diferentes arquitecturas** (Mac M1, Intel, Windows, Linux) gracias a Docker Compose.
- **Base de datos SQL Server** lista para usar en contenedor.
- **Configuración sencilla** y lista para desarrollo o pruebas.
- **Procesamiento eficiente en batches:**  
  El archivo de usuarios se procesa en lotes (batches) cuyo tamaño es configurable mediante variables de entorno, optimizando el uso de memoria y recursos.
- **Resumibilidad y tolerancia a fallos:**  
  El servicio soporta la reanudación automática en caso de fallos o reinicios, gracias a un sistema de checkpoint que guarda el progreso y permite continuar desde la última línea procesada.
- **Validación robusta de datos:**  
  Cada línea del archivo es validada y parseada según un esquema estricto. Las líneas inválidas se descartan y se registran para su posterior análisis, evitando que datos corruptos ingresen al sistema.
- **Manejo de errores y reintentos:**  
  Los lotes que fallan al insertarse en la base de datos se reintentan automáticamente. Si el error persiste, los datos problemáticos se guardan en un archivo de log para su revisión.
- **Métricas y logging detallado:**  
  Durante el procesamiento, se registran métricas como el progreso porcentual, uso de memoria, tiempo de procesamiento por lote y totales, facilitando el monitoreo y la optimización.
- **Manejo seguro de señales de apagado:**  
  El servicio detecta señales de apagado del sistema (SIGINT, SIGTERM) y realiza un cierre controlado, asegurando que no se pierda el progreso y que los datos se mantengan consistentes.
- **Eliminación automática del checkpoint al finalizar:**  
  Una vez que el procesamiento termina exitosamente, el archivo de checkpoint se elimina automáticamente para evitar reanudaciones innecesarias en futuras ejecuciones.

---

¿Te gustaría que agregue este texto directamente en tu archivo `instructions.md` o prefieres que lo adapte a otro formato?

---

## Notas adicionales

- El backend corre por defecto en el puerto `8001`.
- Si necesitas modificar variables de entorno, puedes hacerlo en el archivo `.env`.
- Para correr los tests, puedes usar `pnpm test` (requiere tener pnpm instalado y dependencias instaladas).

---
