/** Prepends the "innfo:" trigger that activates the innv0-router. */
export function innfoPrompt(content: string): string {
  return `innfo: ${content}`
}
