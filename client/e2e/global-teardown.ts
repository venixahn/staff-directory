import { apiPort } from "./ports"

export default async function globalTeardown() {
  if (process.env.E2E_COVERAGE !== "1") return
  const response = await fetch(`http://127.0.0.1:${apiPort}/api/__e2e_coverage__`)
  if (!response.ok) throw new Error(`API coverage flush failed: ${response.status}`)
}
