import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export async function loadScripts(directory, logger) {
  const loaded = []
  const entries = await fs.readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isFile()) continue
    if (!entry.name.endsWith('.js')) continue

    const filePath = path.resolve(directory, entry.name)

    try {
      const module = await import(`${pathToFileURL(filePath).href}?t=${Date.now()}`)
      const script = module.default || module.script || module

      if (!script || typeof script !== 'object') {
        logger.warn({ file: entry.name }, 'Skipped invalid script')
        continue
      }

      loaded.push({
        ...script,
        file: entry.name
      })
    } catch (error) {
      logger.error({ err: error, file: entry.name }, 'Failed to load script')
    }
  }

  return loaded
}