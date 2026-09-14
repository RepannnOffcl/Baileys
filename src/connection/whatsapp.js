import makeWASocket, {
  Browsers,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestWaWebVersion
} from '@whiskeysockets/baileys'
import qrcode from 'qrcode-terminal'
import { config } from '../config.js'

let reconnectTimer = null
let reconnectAttempt = 0
let stopping = false

export function stopConnection() {
  stopping = true
  if (reconnectTimer) clearTimeout(reconnectTimer)
}

function scheduleReconnect(logger, createConnection) {
  if (stopping) return

  reconnectAttempt++
  const delay = Math.min(30000, 2000 * (2 ** Math.min(reconnectAttempt - 1, 4)))

  logger.info({ delay, attempt: reconnectAttempt }, 'Scheduling reconnect')

  clearTimeout(reconnectTimer)
  reconnectTimer = setTimeout(() => {
    createConnection().catch(error => {
      logger.error({ err: error }, 'Reconnect attempt failed')
      scheduleReconnect(logger, createConnection)
    })
  }, delay)
}

export async function connectWhatsApp(logger, onSocket) {
  const createConnection = async () => {
    const { state, saveCreds } = await useMultiFileAuthState(config.authDir)

    let version
    try {
      const latest = await fetchLatestWaWebVersion()
      if (latest?.version) version = latest.version
    } catch (error) {
      logger.warn({ err: error }, 'Latest WA Web version unavailable; using library default')
    }

    const sock = makeWASocket({
      auth: state,
      version,
      browser: Browsers.ubuntu(config.name),
      printQRInTerminal: false,
      markOnlineOnConnect: false,
      syncFullHistory: false,
      generateHighQualityLinkPreview: false,
      logger
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
      if (qr && config.useQr) {
        console.log('\nScan QR dari WhatsApp > Perangkat tertaut:\n')
        qrcode.generate(qr, { small: true })
      }

      if (
        qr &&
        !state.creds.registered &&
        !config.useQr &&
        config.pairingNumber
      ) {
        try {
          const code = await sock.requestPairingCode(config.pairingNumber)
          console.log(`\nPairing Code: ${code}\n`)
        } catch (error) {
          logger.error({ err: error }, 'Pairing code failed')
        }
      }

      if (connection === 'open') {
        reconnectAttempt = 0
        logger.info(`✓ ${config.name} v${config.version} connected`)
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode
        const loggedOut = statusCode === DisconnectReason.loggedOut

        logger.warn({ statusCode, loggedOut }, 'WhatsApp connection closed')

        if (!loggedOut) {
          scheduleReconnect(logger, createConnection)
        } else {
          logger.error('Logged out. Delete sessions/ and pair again.')
        }
      }
    })

    sock.ev.on('messages.upsert', upsert => {
      if (upsert.type !== 'notify') return

      for (const message of upsert.messages || []) {
        Promise.resolve(onSocket(sock, message)).catch(error => {
          logger.error({ err: error }, 'Message dispatch failed')
        })
      }
    })

    return sock
  }

  return createConnection()
}