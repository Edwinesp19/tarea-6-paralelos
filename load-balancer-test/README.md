# Exploración del Balanceador de Carga en Kubernetes con una Aplicación NestJS

## Objetivo

Comprender y demostrar cómo un balanceador de carga en Kubernetes maneja el tráfico entrante hacia múltiples instancias de una aplicación NestJS, especialmente bajo cargas altas.

---

## 1. Desarrollo de la Aplicación en NestJS

### Creación del Proyecto NestJS

```bash
npm install -g @nestjs/cli
nestjs new load-balancer-test
cd load-balancer-test
```

### Creación del Endpoint `/api/load-test`

archivo `src/app.controller.ts`:

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('load-test')
  loadTest(): string {
    let sum = 0;
    for (let i = 0; i < 1e6; i++) {
      sum += Math.sqrt(i);
    }
    return `Load test result: ${sum}`;
  }
}
```

---

## 2. Dockerización de la Aplicación

### Crear `Dockerfile`

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "start"]
EXPOSE 3000
```

### Construir la Imagen Docker

```bash
docker build -t load-balancer-test .
```

---

## 3. Despliegue en Kubernetes con Minikube

### Crear Manifiesto `deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nest-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nest-app
  template:
    metadata:
      labels:
        app: nest-app
    spec:
      containers:
      - name: nest-app
        image: load-balancer-test
        ports:
        - containerPort: 3000
```

### Crear Manifiesto `service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nest-app-service
spec:
  type: LoadBalancer
  selector:
    app: nest-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
```

### Aplicar los Manifiestos

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

### Obtener el Puerto Asignado por Minikube

```bash
minikube service nest-app-service --url
```

---

## 4. Pruebas de Carga con Apache Bench

### Instalar Apache Bench (si no está instalado)

```bash
brew install httpd
```

### Ejecutar la Prueba de Carga

```bash
ab -n 1000 -c 50 http://127.0.0.1:<PUERTO_ASIGNADO>/api/load-test
```

---

## 5. Monitoreo y Análisis

### Verificar los Pods en Kubernetes

```bash
kubectl get pods
```

### Verificar los Logs de los Pods

```bash
kubectl logs -l app=nest-app
```

### Verificar Consumo de Recursos (CPU/Memoria)

```bash
kubectl top pods
```

Si `kubectl top pods` no funciona, instala Metrics Server:

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

---

