import fs from 'node:fs/promises'
import { config } from './config.js'
import { logger } from './utils/logger.js'
import { printBanner } from './core/banner.js'
import { createRunner } from './core/runner.js'
import { connectWhatsApp, stopConnection } from './connection/whatsapp.js'

async function ensureDirectories() {
  await Promise.all([
    fs.mkdir(config.authDir, { recursive: true }),
    fs.mkdir(config.scriptsDir, { recursive: true }),
    fs.mkdir('./data', { recursive: true }),
    fs.mkdir('./logs', { recursive: true })
  ])
}

async function main() {
  printBanner()
  await ensureDirectories()

  console.log('[✓] Engine       : Loaded')
  console.log('[✓] Script system : Ready')
  console.log('[✓] Session       : Ready')
  console.log('[→] WhatsApp      : Connecting...\n')

  let runner

  await connectWhatsApp(logger, async (sock, message) => {
    if (!runner || runner.sock !== sock) {
      runner = await createRunner(sock, logger)
      runner.sock = sock
    }

    await runner.dispatch(message)
  })
}

process.on('uncaughtException', error => {
  logger.error({ err: error }, 'Uncaught exception')
})

process.on('unhandledRejection', error => {
  logger.error({ err: error }, 'Unhandled rejection')
})

async function shutdown(signal) {
  logger.info({ signal }, 'Shutting down RepanOS')
  stopConnection()
  setTimeout(() => process.exit(0), 250)
}

process.once('SIGINT', () => shutdown('SIGINT'))
process.once('SIGTERM', () => shutdown('SIGTERM'))

main().catch(error => {
  logger.error({ err: error }, 'Fatal startup error')
  process.exitCode = 1
})