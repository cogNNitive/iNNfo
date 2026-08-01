/**
 * Base URL for the demo sample models shown on the home page / setup wizard.
 *
 * - In dev, the vite dev server serves the repo's `specs/latest` directory at
 *   `/specs/latest` (see vite.config.ts `serveLocalSpecs`), so samples and
 *   templates reflect the CURRENT working tree.
 * - In production builds, samples are fetched from the published GitHub
 *   `main` branch.
 */
const REMOTE_SAMPLE_BASE = 'https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level2'

export const SAMPLE_BASE: string = import.meta.env.DEV
  ? '/specs/latest/level2'
  : REMOTE_SAMPLE_BASE
