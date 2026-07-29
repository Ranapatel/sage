/**
 * Socket emitter — lightweight wrapper around the global Socket.IO instance.
 *
 * Avoids the circular import dance (notification.service → index.js → …).
 * On cold start the global may not exist yet; we no-op rather than throw.
 */

let ioRef: any = null

export function setSocketIO(io: any) {
  ioRef = io
}

function getIO(): any | null {
  if (ioRef) return ioRef
  try {
    const mod = require('../index.js')
    return typeof mod.getSocketIO === 'function' ? mod.getSocketIO() : null
  } catch {
    return null
  }
}

/**
 * Emit a notification to a single user. Joins the room `user:${userId}` if
 * the user is online. Falls back to no-op when the socket layer is not ready.
 */
export function emitNotification(userId: string, payload: any) {
  const io = getIO()
  if (!io) return false
  try {
    io.to(`user:${userId}`).emit('NOTIFICATION_NEW', payload)
    return true
  } catch (err) {
    console.warn('[SocketEmitter] emitNotification failed:', (err as any)?.message)
    return false
  }
}

/**
 * Emit to a destination room — used for weather + price alerts so multiple
 * users subscribed to the same destination all receive the alert.
 */
export function emitDestinationAlert(destination: string, type: string, payload: any) {
  const io = getIO()
  if (!io) return false
  try {
    io.to(`dest:${destination.toLowerCase()}`).emit(type, payload)
    return true
  } catch (err) {
    console.warn('[SocketEmitter] emitDestinationAlert failed:', (err as any)?.message)
    return false
  }
}