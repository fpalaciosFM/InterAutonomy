# Interautonomy: Ecosistema de Estrategias para el Emprendimiento Social

**Interautonomy** es una plataforma diseñada para ayudar a emprendedores sociales a descubrir, aprender y aplicar estrategias de autosustentabilidad basadas en casos de éxito reales. Este repositorio contiene el ecosistema completo: desde la ingesta de datos mediante scraping hasta un portal web de última generación con soporte multi-idioma.

---

## 🚀 Arquitectura del Proyecto

El proyecto está organizado bajo una estructura de **Monorepo**, dividida en tres capas principales que aseguran la escalabilidad y el orden de los datos:

### 1. Ingesta de Datos (`/Scraping`)
* **Tecnología:** Python + BeautifulSoup4.
* **Función:** Automatiza la extracción de contenido desde fuentes externas en tres idiomas: Español (ES), Inglés (EN) y Chino (ZH).
* **Innovación:** Vinculación dinámica de párrafos específicos de proyectos con estrategias técnicas (metodologías).

### 2. Infraestructura y Base de Datos (`/Supabase`)
* **Tecnología:** Supabase (PostgreSQL + JSONB).
* **Estrategia de Datos:** Uso de columnas `JSONB` para manejar traducciones de forma atómica, optimizando las consultas y reduciendo la complejidad del esquema.
* **Seguridad:** Gestión de secretos mediante variables de entorno (`.env`) y roles de acceso.

### 3. Portal Web (`/portal-interautonomy`)
* **Framework:** **Next.js 15** + **React 19** (Uso de Server Components y Actions).
* **Estilos:** Tailwind CSS + shadcn/ui.
* **Experiencia de Usuario:** Interfaz optimizada para la lectura técnica y el aprendizaje interactivo de estrategias sociales.

---

## 🛠️ Stack Tecnológico

| Capa           | Tecnología                                    |
| :------------- | :-------------------------------------------- |
| **Frontend**   | React 19, Next.js 15 (App Router), TypeScript |
| **Estilos**    | Tailwind CSS, Lucide React, shadcn/ui         |
| **Backend/DB** | Supabase (PostgreSQL), Edge Functions         |
| **Data Eng.**  | Python 3.x, BeautifulSoup, Dotenv             |
| **Despliegue** | Vercel (Frontend), Supabase Cloud (Data)      |

---

## 📁 Estructura del Repositorio

```text
├── Scraping/           # Scripts de extracción y limpieza de datos (Python)
│   ├── Projects/       # Scrapers y JSONs de proyectos sociales
│   └── Strategies/     # Scrapers y JSONs de metodologías técnicas
├── Supabase/           # Scripts SQL y herramientas de migración (Python/SQL)
└── portal-interautonomy/ # Aplicación Web de última generación (Next.js)
```

---

## 🔧 Configuración Local

### Requisitos previos
* Node.js (v20+ recomendado)
* Python 3.8+
* Cuenta activa en Supabase

### Pasos iniciales
1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/fpalaciosFM/InterAutonomy.git
    cd interautonomy
    ```
2.  **Configurar variables de entorno:**
    * Crear un archivo `.env` en la carpeta `Supabase/` para los scripts de migración.
    * Crear un archivo `.env.local` en la carpeta `portal-interautonomy/` para la aplicación web.
3.  **Lanzar el portal de desarrollo:**
    ```bash
    cd portal-interautonomy
    npm install
    npm run dev
    ```
---

## 👤 Autor

**Fernando Palacios Ahumada** *Consultor TI*

---
