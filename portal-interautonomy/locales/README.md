# Locales folder

Estructura de localizaciones para la app.

Formato: JSON por idioma y por página. Ejemplo de rutas:

- `locales/en/home.json`
- `locales/en/strategies.json`
- `locales/es/home.json`
- `locales/es/strategies.json`

Convenciones:
- Mantener keys semánticas (por ejemplo `hero.title`, `page.title`).
- Usar `\n` para saltos de línea en títulos multilínea.
- Añadir archivos adicionales por página cuando se implementen nuevas rutas.

Uso rápido (ejemplo en un componente React/Next.js):

```ts
import enHome from '../locales/en/home.json'

const title = enHome.hero.title
```

Recomendación: integrar con `next-i18next` o `next-translate` para carga automática por `locale`.
