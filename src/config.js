import 'dotenv/config'

export const config = {
  name: process.env.REPANOS_NAME || 'RepanOS',
  version: process.env.REPANOS_VERSION || '1.0.0',
  prefix: process.env.PREFIX || '.',
  useQr: String(process.env.USE_QR || 'false').toLowerCase() === 'true',
  pairingNumber: (process.env.PAIRING_NUMBER || '').replace(/\D/g, ''),
  logLevel: process.env.LOG_LEVEL || 'info',
  authDir: './sessions',
  scriptsDir: './scripts'
}