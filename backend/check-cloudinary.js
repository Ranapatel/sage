require('dotenv').config()
const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

console.log('=== Cloudinary Config ===')
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET')
console.log('API Key:', (process.env.CLOUDINARY_API_KEY || '').substring(0, 6) + '...')
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET')

async function main() {
  try {
    // Check if there are any uploaded resources in the tripsage folder
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'tripsage/',
      max_results: 10,
    })

    console.log('\n=== Cloudinary Storage ===')
    console.log('Total images found in tripsage/ folder:', result.resources.length)

    if (result.resources.length > 0) {
      result.resources.forEach((r, i) => {
        console.log(`  ${i + 1}. public_id: ${r.public_id}`)
        console.log(`     format: ${r.format} | size: ${(r.bytes / 1024).toFixed(1)}KB`)
        console.log(`     url: ${r.secure_url.substring(0, 90)}...`)
        console.log(`     created: ${r.created_at}`)
      })
    } else {
      console.log('  No images found in Cloudinary tripsage/ folder.')
    }

    // Check account usage
    const usage = await cloudinary.api.usage()
    console.log('\n=== Cloudinary Account Usage ===')
    console.log('Plan:', usage.plan)
    console.log('Storage used:', (usage.storage.usage / (1024 * 1024)).toFixed(2), 'MB')
    console.log('Bandwidth used:', (usage.bandwidth.usage / (1024 * 1024)).toFixed(2), 'MB')
    console.log('Transformations:', usage.transformations?.usage || 0)

  } catch (err) {
    const errMsg = err?.message || err?.error?.message || JSON.stringify(err)
    console.error('Cloudinary Error:', errMsg)
    if (errMsg.includes('Must supply') || errMsg.includes('mismatch')) {
      console.log('\n⚠️  Cloudinary credentials mismatch or missing.')
      console.log('Update CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env')
    }
  }
}

main()
