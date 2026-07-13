import axios from 'axios'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '../.env') })

const url = process.env.UPSTASH_REDIS_REST_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN

async function clear() {
  if (!url || !token) {
    console.error('Credentials missing.')
    return
  }
  try {
    const res = await axios.post(url, ['FLUSHDB'], {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log('Cache cleared successfully:', res.data)
  } catch (err: any) {
    console.error('Failed to clear cache:', err.message)
  }
}
clear()
