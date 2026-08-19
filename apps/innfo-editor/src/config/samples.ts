/**
 * Base URL for the demo sample models shown on the home page / setup wizard.
 *
 * - In dev, the vite dev server serves the repo's `specs` directory at
 *   `/specs` (see vite.config.ts `serveLocalSpecs`), so samples and
 *   templates reflect the CURRENT working tree.
 * - In production builds, samples are fetched from the published GitHub
 *   `main` branch.
 *
 * Callers build `${SAMPLE_BASE}/{templateName}/samples/{file}`, matching the
 * `specs/templates/{name}/samples/` layout (see `spec-versioning`, R-SV-01).
 */
const REMOTE_SAMPLE_BASE = 'https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/templates'

export const SAMPLE_BASE: string = import.meta.env.DEV ? '/specs/templates' : REMOTE_SAMPLE_BASE
