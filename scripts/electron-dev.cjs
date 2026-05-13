const net = require('net')
const path = require('path')
const { spawn } = require('child_process')

const DEV_PORT = 5590
const START_TIMEOUT_MS = 30000
const RETRY_DELAY_MS = 300

function waitForPort(port, timeoutMs) {
  const startedAt = Date.now()

  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const socket = net.createConnection({ host: '127.0.0.1', port })

      socket.once('connect', () => {
        socket.end()
        resolve()
      })

      socket.once('error', () => {
        socket.destroy()

        if (Date.now() - startedAt >= timeoutMs) {
          reject(new Error(`Dev server not ready on port ${port} after ${timeoutMs}ms`))
          return
        }

        setTimeout(tryConnect, RETRY_DELAY_MS)
      })
    }

    tryConnect()
  })
}

async function startElectron() {
  await waitForPort(DEV_PORT, START_TIMEOUT_MS)

  const env = { ...process.env }
  delete env.ELECTRON_RUN_AS_NODE

  const electronBinary =
    process.platform === 'win32'
      ? path.join(__dirname, '..', 'node_modules', '.bin', 'electron.cmd')
      : path.join(__dirname, '..', 'node_modules', '.bin', 'electron')

  const electronProcess = spawn(electronBinary, ['.'], {
    cwd: path.join(__dirname, '..'),
    env,
    stdio: 'inherit',
  })

  electronProcess.on('exit', (code) => {
    process.exit(code ?? 0)
  })

  electronProcess.on('error', (error) => {
    console.error('Failed to start Electron:', error)
    process.exit(1)
  })
}

startElectron().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
