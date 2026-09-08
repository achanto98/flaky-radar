# FlakyRadar — Progreso

> Estado de avance contra el plan de trabajo de `CLAUDE.md` (sección 6). Actualizar al final de cada sesión.

## Hecho

**Paso 1 — Setup del repo**
- `package.json`: TypeScript, Jest + ts-jest, `@vercel/ncc`, `@actions/core`, `@actions/github`.
- `tsconfig.json`, `jest.config.js`.
- `action.yml` esqueleto: input `junit-path` (required), input `github-token`, output `flaky-count`, `runs.main: dist/index.js`.
- `src/index.ts`: entry point mínimo, lee `junit-path`, deja el output en `0`.
- `.gitignore` (nota: `dist/` NO está ignorado — se commitea, como indica la sección 5 del brief).
- `CLAUDE.md` (copia del brief, para que Claude Code lo lea automático como contexto).
- Verificado: `npm run lint` (tsc --noEmit), `npm test` (jest), `npm run build` (ncc → `dist/index.js`, ~949kB) — los tres corren limpio.

**Paso 2 — Parser de JUnit XML**
- `src/parseJUnit.ts`: `parseJUnitXml(xml: string)` y `parseJUnitFile(path: string)`.
- Usa `fast-xml-parser`. Soporta raíz `<testsuites>` (jest-junit) y raíz `<testsuite>` suelta (pytest).
- Estructura interna: `{ suite, testName, status: 'passed'|'failed'|'skipped', duration }`. `<error>` se trata igual que `<failure>`.
- Nota: `commit` (mencionado en la sección 4 del brief) NO se parsea del XML — se agrega después con `github.context.sha` cuando se arme el registro de historial (paso 3).
- Tests: `__tests__/parseJUnit.test.ts` + fixtures `__tests__/fixtures/{jest,pytest}.xml`. Cubre: jest-junit, pytest, XML sin testsuites, `<error>` como falla.
- Estado: 5 tests pasando, typecheck limpio.

## Sin commitear

Todo el trabajo de arriba está en el working tree, sin ningún commit todavía (repo inicializado con `git init` pero vacío de historia). Avisame cuándo querés que arme el primer commit.

## Por hacer (sección 6 del brief)

3. **`history.ts`** — persistir historial entre corridas (via `actions/cache` o `upload-artifact`/`download-artifact`), keyeado por rama/repo. Guarda por test: nombre, suite, últimos N resultados, commit.
4. **`flakiness.ts`** — score simple = frecuencia de inconsistencia pass/fail para el mismo test en el mismo commit a través de corridas recientes.
5. **Job Summary** (`report.ts` / `core.summary`) — tabla con tests flaky, frecuencia, última vez visto.
6. **Comentario en PR** — vía `github-script`/Octokit, requiere `pull-requests: write`. (Opcional en V0 pero de bajo costo.)
7. **Tests unitarios** del parser (ya cubierto en paso 2) y del cálculo de flakiness (pendiente, paso 4).
8. **README** con ejemplo real de uso (portafolio).
9. **Workflow de dogfooding** (`.github/workflows/dogfood.yml`) — la Action corriendo sobre sí misma.
10. **Publicación en GitHub Marketplace.**

## Próxima sesión sugerida

Paso 3: `history.ts`. Decisión pendiente a tomar con Armando: `actions/cache` vs `upload-artifact`/`download-artifact` como mecanismo de persistencia (trade-offs: cache tiene límites de tamaño/expiración por rama; artifacts requieren permisos y son más explícitos entre workflows).
