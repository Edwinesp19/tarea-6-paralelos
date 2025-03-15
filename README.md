
# Exploración del Balanceador de Carga en Kubernetes con una Aplicación NestJS

## Objetivo

El objetivo de este proyecto es comprender y demostrar cómo un balanceador de carga en Kubernetes maneja el tráfico entrante hacia múltiples instancias de una aplicación NestJS, especialmente bajo cargas altas.

## Descripción de la Tarea

### 1. Desarrollo de la Aplicación en NestJS

La primera parte del proyecto consiste en desarrollar una aplicación simple utilizando NestJS que exponga un endpoint GET `/api/load-test`.

- Este endpoint puede realizar una tarea simple como devolver un mensaje estático o realizar una pequeña operación matemática para simular carga.

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('api')
export class AppController {
  @Get('load-test')
  loadTest() {
    return { message: 'Carga simulada exitosa' };
  }
}
```

### 2. Dockerización de la Aplicación

En esta fase, se crea un `Dockerfile` para contenerizar la aplicación de NestJS y luego se construye la imagen Docker.

Pasos:
- Escribir un `Dockerfile` para contenerizar la aplicación.
- Construir la imagen Docker utilizando el siguiente comando:

```bash
docker build -t nestjs-load-balancer .
```

Ejemplo de `Dockerfile`:

```dockerfile
# Usar una imagen base de Node.js
FROM node:16-alpine

# Establecer el directorio de trabajo
WORKDIR /usr/src/app

# Copiar los archivos de la aplicación
COPY . .

# Instalar dependencias
RUN npm install

# Exponer el puerto donde corre la aplicación
EXPOSE 3000

# Iniciar la aplicación
CMD ["npm", "run", "start:prod"]
```

### 3. Despliegue en Kubernetes

Una vez que la aplicación está dockerizada, se procederá al despliegue en un cluster de Kubernetes. Para ello, se escribirán los manifiestos de Kubernetes necesarios.

Pasos:
- Crear un `Deployment` que especifique múltiples réplicas de la aplicación.
- Crear un `Service` de tipo LoadBalancer para distribuir el tráfico entre las réplicas.

Ejemplo de manifiesto de Kubernetes (`deployment.yaml`):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nestjs-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nestjs
  template:
    metadata:
      labels:
        app: nestjs
    spec:
      containers:
      - name: nestjs
        image: nestjs-load-balancer
        ports:
        - containerPort: 3000
---
apiVersion: v1
kind: Service
metadata:
  name: nestjs-service
spec:
  type: LoadBalancer
  selector:
    app: nestjs
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
```

### 4. Pruebas de Carga

Para simular tráfico alto y probar el balanceador de carga, se utilizarán herramientas como Apache Bench o JMeter. El objetivo es enviar 1000 solicitudes simultáneas al endpoint GET `/api/load-test` y observar cómo el balanceador de carga distribuye las solicitudes entre las diferentes instancias de la aplicación.

Ejemplo de comando utilizando Apache Bench:

```bash
ab -n 1000 -c 100 http://<LOAD_BALANCER_IP>/api/load-test
```

### Resultados Esperados

- Descripción detallada del proceso de construcción, dockerización y despliegue de la aplicación en Kubernetes.
- Análisis del comportamiento del balanceador de carga durante las pruebas de carga, incluyendo cómo las solicitudes son distribuidas entre las instancias de la aplicación.

### Evaluación

La evaluación del proyecto se basará en los siguientes aspectos:
- Calidad de la implementación y configuración en Kubernetes.
- Claridad en la documentación del proceso y análisis de los resultados obtenidos durante las pruebas de carga.
