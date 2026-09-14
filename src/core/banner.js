import { config } from '../config.js'

export function printBanner() {
  console.clear()
  console.log(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║             BAILEYS BY REPANOFFCL               ║
║                                                  ║
║                 SCRIPT RUNNER                   ║
║                                                  ║
╚══════════════════════════════════════════════════╝

  Engine   : ${config.name} v${config.version}
  Runtime  : Node.js ${process.version}
`)
}