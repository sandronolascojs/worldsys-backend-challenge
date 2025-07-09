# 🧪 Challenge Técnico – Desarrollador Backend (Node.js)

## 📘 Contexto

Estás trabajando en un microservicio backend desarrollado en **Node.js**. Este servicio corre dentro de un contenedor **Docker**, sobre un entorno **Kubernetes** con sistema operativo **Linux**.

El sistema recibe diariamente un archivo de gran tamaño (aproximadamente **1 GB**) con registros de clientes. Cada línea del archivo representa un registro separado. Tu objetivo es procesar este archivo y volcar los datos en una base de datos **SQL Server**.

---

## 🎯 Objetivo

Desarrollar una solución que:

1. Procese correctamente el contenido del archivo `CLIENTES_IN_0425.dat`.

2. Inserte los datos procesados en una tabla de SQL Server.

3. Exponga un endpoint HTTP `/health` que refleje que el servicio está operativo incluso durante el procesamiento.

4. Entregue una propuesta técnica que escale para archivos 5 veces más grandes.

---

## 📦 Entrega esperada

Debes entregar:

- Código fuente del servicio completo.

- Script SQL para crear la tabla de destino.

- Instrucciones claras de cómo ejecutar el servicio (puede ser con `docker-compose`, `Makefile`, etc.).

- Un documento (.md) con instrucciones para levantar la solución en un ambiente local.

---

## ⚙️ Condiciones del entorno

El servicio se ejecutará en un pod de Kubernetes con los siguientes recursos:

```yaml

resources:

requests:

memory: "128Mi"

cpu: "100m"

limits:

memory: "256Mi"

cpu: "200m"

```

---

## 🚫 Reglas

- No se permite modificar la estructura del archivo ni preprocesarlo fuera del servicio.

- Deberás ser capaz de defender todo lo implementado durante la entrevista técnica.

---

## ✨ Extras (no obligatorios, pero suman)

- Tolerancia a errores en líneas corruptas del archivo.

- Monitoreo del avance o performance.

- Métricas de uso de memoria o CPU.

- Estrategia para paralelizar el procesamiento o escalar horizontalmente.

- Uso de logs informativos.

---

## 🧪 Generación del archivo de prueba

Este proyecto ya incluye un script que genera el archivo `CLIENTES_IN_0425.dat` con datos aleatorios, incluyendo un porcentaje de líneas con errores intencionales.

### ⚙️ Parámetros de generación (modificables)

Dentro del archivo `src/generateFile.ts` podés modificar estos valores para realizar tus pruebas:

```ts
// Cantidad total de líneas a generar
const RECORDS = 100_000;

// Porcentaje de líneas con errores intencionales (0.0 a 1.0)
const ERROR_RATE = 0.2; // 20%
```

### ✅ Pasos para generar el archivo

1. Instalá dependencias:

```bash

npm  install

```

2. Ejecutá el generador:

```bash

npx ts-node src/generateFile.ts

```

Esto generará el archivo en:

```

challenge/input/CLIENTES_IN_0425.dat

```

### 📄 Formato del archivo

Cada línea tiene el siguiente formato, separado por `|`:

```

<nombre>|<apellido>|<dni>|<estado>|<fechaIngreso>|<esPep>|<esSujetoObligado>

```

Ejemplo:

```

María|Gómez|45678901|Activo|11/13/2021|true|false

Carlos|Pérez|32165498|Inactivo|99/99/9999||

```

---

## 🧩 Definición mínima esperada para la tabla en SQL Server

Podés diseñar la tabla, pero como **mínimo** debe incluir las siguientes especificaciones:

```sql

NombreCompleto NVARCHAR(100) NOT NULL,

DNI BIGINT  NOT NULL,

Estado VARCHAR(10) NOT NULL,

FechaIngreso DATE NOT NULL,

EsPEP BIT NOT NULL,

EsSujetoObligado BIT  NULL,

FechaCreacion DATETIME  NOT NULL

```

---

## 🔁 Cómo entregar

Podés entregar tu solución de alguna de las siguientes formas:

1. Forkeando este repositorio a tu cuenta personal y compartirnos el link a tu fork.

2. Subiendo tu solución a un repositorio personal (público o privado) y enviándonos el link.

3. Compartiendo un `[tu-nombre].zip` del proyecto por correo (sin el archivo `CLIENTES_IN_0425.dat`).

---
