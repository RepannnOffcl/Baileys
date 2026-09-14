import { loadScripts } from '../loader/script-loader.js'
import { getText, unwrapMessage } from '../utils/message.js'
import { config } from '../config.js'

export async function createRunner(sock, logger) {
  const scripts = await loadScripts(config.scriptsDir, logger)

  logger.info({ count: scripts.length }, 'Scripts loaded')

  async function dispatch(message) {
    if (!message?.message || message.key?.fromMe) return

    const content = unwrapMessage(message.message)
    const text = getText(content).trim()
    const jid = message.key.remoteJid

    const ctx = {
      sock,
      message,
      content,
      text,
      jid,
      isGroup: jid?.endsWith('@g.us') || false,
      sender: message.key.participant || jid,
      config,
      reply: (payload, options = {}) =>
        sock.sendMessage(
          jid,
          typeof payload === 'string' ? { text: payload } : payload,
          { quoted: message, ...options }
        )
    }

    for (const script of scripts) {
      try {
        if (typeof script.onMessage === 'function') {
          await script.onMessage(ctx)
        }
      } catch (error) {
        logger.error(
          { err: error, script: script.name || script.file },
          'Script execution error'
        )
      }
    }
  }

  return {
    scripts,
    dispatch
  }
}