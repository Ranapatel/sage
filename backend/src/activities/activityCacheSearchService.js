const { activityCache } = require('../models/Activity')
const { cacheGet, cacheSet, generateCacheKey } = require('../../config/redis')

const SEARCH_CACHE_TTL_SECONDS = 10 * 60

function normalizeSearchInput(input = {}) {
  return {
    destinationCode: input.destinationCode || undefined,
    keyword: input.keyword || undefined,
    category: input.category || input.activityType || undefined,
    segment: input.segment || undefined,
    minPrice: input.minPrice,
    maxPrice: input.maxPrice,
    page: Number(input.page || input.from || 1),
    limit: Number(input.limit || input.to || 20),
  }
}

async function searchCachedActivities(input = {}) {
  const filters = normalizeSearchInput(input)
  const cacheKey = generateCacheKey('activities:cache-search', filters)
  const cached = await cacheGet(cacheKey)
  if (cached) {
    return { ...cached, cached: true }
  }

  const result = await activityCache.search(filters)
  const response = {
    ...result,
    filters,
    cached: false,
  }
  await cacheSet(cacheKey, response, SEARCH_CACHE_TTL_SECONDS)
  return response
}

module.exports = { normalizeSearchInput, searchCachedActivities }
