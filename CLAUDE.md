# FlakyRadar — Brief técnico de arranque (V0)

> Este documento es el puente entre el plan de producto (`plan_proyecto_flakyradar.md`) y el primer commit de código. Está pensado para pegarlo en la raíz del repo (como `CLAUDE.md` o contexto inicial) y usarlo directamente con Claude Code en terminal.

## 1. Contexto en una línea

FlakyRadar es una GitHub Action, sin backend, que detecta tests flaky comparando reportes JUnit XML entre corridas del mismo repo y publica los resultados en el Job Summary y en comentarios de PR. Es proyecto de portafolio (QA/SDET) y semilla de negocio (dashboard de pago en V1, solo si V0 muestra tracción).

## 2. Alcance de V0 — qué construir y qué no

**Sí es V0:**
- Acción de GitHub Actions que corre después de los tests.
- Parseo de reportes JUnit XML.
- Comparación contra corridas anteriores del mismo repo, usando `actions/cache` o `upload-artifact`/`download-artifact` — sin base de datos ni servicio externo.
- Score simple de flakiness basado en frecuencia de resultados inconsistentes en el mismo commit.
- Reporte en el Job Summary de GitHub Actions.
- Comentario automático en el PR (si el permiso lo permite).

**No es V0** (explícitamente fuera de alcance — ver sección 8):
- Dashboard, backend, base de datos propia.
- Soporte para CircleCI, Jenkins u otro CI.
- Cuentas de equipo, autenticación, integraciones con Jira/Linear.
- Algoritmo de flakiness sofisticado (machine learning, ventanas de tiempo complejas, etc.).

## 3. Decisión de stack: TypeScript (JavaScript Action, sin Docker)

Se elige una **Action de JavaScript/TypeScript nativa** (no Docker container action) por tres razones prácticas:

- Arranque más rápido en cada corrida de CI (no hay que construir ni levantar una imagen Docker en cada ejecución).
- Empaquetado simple con `@vercel/ncc` a un solo archivo `dist/index.js` — nada que publicar aparte en un registry de contenedores.
- Es el camino más simple para llegar al Marketplace con una V0 funcional, que es el criterio de "MVP simplest" del proyecto.

Trade-off reconocido: el trasfondo de Armando es más fuerte en Python/QA, pero una Docker action añade un paso de build/push de imagen que no aporta nada a un parser de XML + comparación de historial. Si en el futuro se necesita lógica más pesada (ML, análisis estadístico), se puede reevaluar — no antes.

## 4. Arquitectura V0 (alto nivel)

1. **Input**: rutas (glob) a archivos JUnit XML generados por el paso de tests del workflow del usuario.
2. **Historial entre corridas**: se persiste un resumen compacto (por test: nombre, suite, últimos N resultados, commit) como artifact o vía `actions/cache`, keyeado por rama/repo.
3. **Cálculo de flakiness**: comparar resultados del mismo test en el mismo commit/código a través de corridas recientes; score simple = frecuencia de inconsistencia.
4. **Salida**: 
   - `core.summary` → tabla en el Job Summary con tests flaky, frecuencia, última vez visto.
   - Comentario en el PR vía `github-script`/Octokit (requiere permiso `pull-requests: write`).

## 5. Estructura de repo propuesta

```
flakyradar/
  action.yml
  src/
    index.ts
    parseJUnit.ts      # parsea XML a estructura interna
    history.ts         # lee/escribe historial via cache o artifacts
    flakiness.ts        # calcula el score
    report.ts          # arma Job Summary y comentario de PR
  dist/                 # bundle generado por ncc (se commitea)
  __tests__/
  README.md
  .github/workflows/
    ci.yml              # build + test del propio proyecto
    dogfood.yml         # corre la Action sobre sus propios tests
```

## 6. Plan de trabajo (pasos pequeños, uno por sesión con Claude Code)

1. Setup del repo: `package.json`, TypeScript, `action.yml` esqueleto, Jest, ncc.
2. Parser de JUnit XML → estructura interna `{ testName, suite, status, duration, commit }`.
3. Mecanismo de historial persistido entre corridas (cache/artifact).
4. Cálculo del score de flakiness.
5. Generación del Job Summary.
6. Comentario en PR (opcional dentro de V0, pero de bajo costo agregarlo).
7. Tests unitarios del parser y del cálculo de flakiness.
8. README con ejemplo real de uso (portafolio).
9. Workflow de dogfooding: la Action corriendo sobre sí misma.
10. Publicación en GitHub Marketplace.

## 7. Definición de "hecho" para V0

- [ ] Corre enteramente dentro de GitHub Actions, sin backend ni servicios externos.
- [ ] Parsea JUnit XML de al menos un framework común (jest, pytest, etc.).
- [ ] Detecta inconsistencia pass/fail en el mismo commit usando historial persistido.
- [ ] Publica resumen en el Job Summary.
- [ ] README claro con instrucciones de instalación y uso.
- [ ] Probado sobre al menos un repo real (propio o de código abierto).

## 8. No-goals explícitos (pegar esto directo en el prompt a Claude Code si empieza a irse por las ramas)

- Nada de backend, base de datos, ni dashboard propio en V0.
- Nada de soporte multi-CI en V0.
- Nada de cuentas de equipo, autenticación ni integraciones externas en V0.
- No pulir el algoritmo de flakiness más allá de un score simple por frecuencia — eso se sofistica en V1/V2 solo si hay tracción real.

## 9. Cómo usar este documento con Claude en terminal

1. Copiar este archivo a la raíz del repo (sugerido: como `CLAUDE.md`, así Claude Code lo lee automáticamente como contexto del proyecto).
2. Primera instrucción sugerida para la sesión de terminal:
   > "Lee CLAUDE.md. Empecemos por el paso 1 del plan de trabajo: setup del repo con TypeScript, Jest y action.yml esqueleto."
3. Avanzar paso por paso (sección 6), no pedir todo V0 de una sola vez — cada paso es una unidad de trabajo revisable.
4. Si Claude Code propone algo fuera de alcance (dashboard, multi-CI, etc.), señalar la sección 8.

## 10. Referencia

Plan de producto completo: `plan_proyecto_flakyradar.md` (contexto de negocio, distribución, monetización y riesgos — no repetido aquí a propósito).
