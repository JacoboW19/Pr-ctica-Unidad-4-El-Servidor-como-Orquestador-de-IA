# Investigación y Preparación
---

## 1. Lógica del servidor: API de Base de Datos vs. API de IA
La lógica del servidor cambia significativamente. Consumir una API de base de datos (SQL/NoSQL) suele ser determinista y estructurado: envías una consulta precisa y recibes un conjunto de datos exacto. Al consumir una API de IA (como Gemini), la lógica debe manejar escenarios no deterministas, variabilidad en los tiempos de respuesta (latencia), construcción y optimización de prompts dinámicos, y a menudo la gestión de respuestas por bloques (streaming).

| Característica | API de Base de Datos (SQL / NoSQL) | API de Inteligencia Artificial (LLM) |
| :--- | :--- | :--- |
| **Naturaleza de la Respuesta** | **Determinista:** Devuelve datos exactos y estructurados. Si hay un error, es predecible y tipado. | **Probabilística:** El contenido y formato pueden variar. Puede incluir texto no deseado o evadir restricciones. |
| **Rol del Backend** | Mapeo directo de datos (ORM/ODM) y envío rápido de estructuras JSON al cliente. | **Validación, sanitización y estructuración estricta** del *output* antes de ser procesado o guardado. |
| **Gestión de Latencia** | **Síncrona y ultra rápida:** Respuestas en milisegundos. Bloqueo mínimo del hilo de ejecución. | **Asíncrona y lenta:** La generación toma segundos. Requiere estrategias de *Streaming* (Server-Sent Events / WebSockets). |
| **Manejo de Estado** | **Con estado (Stateful):** El estado y la persistencia residen directamente en las tablas/colecciones. | **Sin estado (Stateless):** El backend debe gestionar la *ventana de contexto* (historial de mensajes) en cada petición. |

---

## 2. Seguridad: Exposición de API Keys y el Patrón Proxy

**Vulnerabilidad Crítica:** Exponer una clave de API (API Key) directamente en el frontend (componentes de cliente, SPAs, aplicaciones móviles) es el equivalente digital a dejar las llaves maestras de producción pegadas en la puerta de acceso. Cualquier usuario puede inspeccionar el código o el tráfico de red y extraerla.

### Riesgos Principales
* **Secuestro de Facturación:** Explotación automatizada de tus cuotas de consumo por terceros, generando costos elevados en pocas horas.
* **Denegación de Servicio (DoS por Rate Limits):** Los atacantes pueden saturar el límite de peticiones de la clave, dejando la aplicación inoperativa para los usuarios legítimos.

### Solución Arquitectónica: El Patrón Proxy

La comunicación directa desde el navegador a los servidores de la IA debe reemplazarse por una capa intermedia en el backend.

```
[ Frontend / Cliente ] 
       │
       │ Petición sin credenciales (ej. POST /api/generate)
       ▼
[ Tu Backend (Servidor Seguro) ]  ◄── Inyecta la API Key desde Variables de Entorno (.env)
       │
       │ Petición Autorizada (Headers: Authorization Bearer)
       ▼
[ API de Google Gemini ]
```

#### Flujo de Implementación:
1. **Aislamiento del Secreto:** Almacena la clave exclusivamente en el servidor utilizando variables de entorno (`process.env.GEMINI_API_KEY`).
2. **Punto de Enlace Seguro (Endpoint):** El frontend solicita el servicio consumiendo un endpoint propio (ej. `/api/chat`), enviando únicamente el prompt del usuario y sus tokens de sesión/autenticación de la app.
3. **Validación e Inyección:** El servidor valida la identidad del usuario, construye el payload estructurado, inyecta la API Key de forma interna y realiza la petición HTTPS hacia los servidores de Gemini.
4. **Retransmisión Controlada:** El backend recibe la respuesta del modelo, realiza el filtrado de seguridad correspondiente y la devuelve al frontend. **La API Key jamás viaja por la red pública del cliente.**

---

## 3. Herramientas: Google AI Studio en el Flujo de Desarrollo

**Google AI Studio** es un entorno de desarrollo rápido basado en la web (*sandbox*) diseñado para experimentar y prototipar con la familia de modelos de Gemini antes de escribir código de producción.

```
┌───────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐
│  Prototipado en   │ ───► │  Ajuste de Parámetros  │ ───► │  Exportación Directa   │
│  AI Studio (Web)  │      │  y Esquemas JSON       │      │  a Código de Backend   │
└───────────────────┘      └────────────────────────┘      └────────────────────────┘
```

### Funciones Clave y Beneficios

* **Ingeniería de Prompts Rápida:** Permite iterar de forma gráfica sobre las instrucciones del sistema, definir el comportamiento de agentes conversacionales y refinar el contexto sin necesidad de desplegar o compilar código.
* **Control de Hiperparámetros:** Interfaz visual para calibrar la *Temperatura* (nivel de aleatoriedad/creatividad), *Top-K* y *Top-P*, permitiendo balancear el comportamiento entre respuestas creativas o respuestas técnicas precisas.
* **Estructuración del Output (Structured Outputs):** Facilita la definición de esquemas de datos estructurados para obligar al modelo a responder en formatos estrictos (como un JSON que cumpla con una interfaz específica), algo vital para guardar la salida directamente en una base de datos.
* **Exportación de Código (Hand-off):** Una vez validado el prompt, la herramienta genera el fragmento de código exacto en lenguajes como Python, JavaScript (Node.js) o comandos `cURL` utilizando los SDKs oficiales de Google Gen AI para una integración directa en el backend.
