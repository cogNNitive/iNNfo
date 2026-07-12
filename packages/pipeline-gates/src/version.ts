const VERSION_RE = /^V_(\d+)(?:-(\d+))?(?:-(\d+))?$/
const VERSION_IN_NAME_RE = /V_(\d+(?:-\d+)?(?:-\d+)?)/

export interface ParsedVersion {
  major: number
  minor: number
  patch: number
}

export function parseVersion(version: string): ParsedVersion | null {
  const m = version.match(VERSION_RE)
  if (!m) return null
  return {
    major: parseInt(m[1], 10),
    minor: m[2] !== undefined ? parseInt(m[2], 10) : 0,
    patch: m[3] !== undefined ? parseInt(m[3], 10) : 0,
  }
}

export function formatVersion(v: ParsedVersion): string {
  return `V_${v.major}-${v.minor}-${v.patch}`
}

export function incrementPatch(version: string): string | null {
  const parsed = parseVersion(version)
  if (!parsed) return null
  parsed.patch += 1
  return formatVersion(parsed)
}

export function extractVersionFromFilename(filename: string): string | null {
  const m = filename.match(VERSION_IN_NAME_RE)
  return m ? `V_${m[1]}` : null
}

export function replaceVersionInFilename(filename: string, newVersion: string): string {
  return filename.replace(VERSION_IN_NAME_RE, newVersion)
}
