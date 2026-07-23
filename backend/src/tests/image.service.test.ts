require('dotenv').config();
import { ImageQueryBuilder } from '../utils/imageQueryBuilder';
import { ImageCache } from '../cache/image.cache';
import { ImageService } from '../services/image.service';
import { ImageSearchRequest } from '../types/image';

async function runTests() {
  console.log('==================================================');
  console.log('🧪 RUNNING IMAGE SERVICE ARCHITECTURE UNIT TESTS');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // ── 1. ImageQueryBuilder Tests ──────────────────────────────────────────────
  console.log('--- 1. Testing ImageQueryBuilder ---');

  const hotelReq: ImageSearchRequest = {
    entityName: 'Taj Palace',
    entityType: 'hotel',
    city: 'New Delhi',
    country: 'India',
  };
  const hotelQueries = ImageQueryBuilder.buildQueries(hotelReq);
  assert(hotelQueries.includes('Taj Palace New Delhi India hotel'), 'Hotel query includes full name + city + country');
  assert(hotelQueries.includes('Taj Palace New Delhi hotel'), 'Hotel query includes fallback name + city');
  assert(hotelQueries.includes('Taj Palace hotel'), 'Hotel query includes fallback name');

  const restReq: ImageSearchRequest = {
    entityName: 'Olive Bar & Kitchen',
    entityType: 'restaurant',
    city: 'New Delhi',
  };
  const restQueries = ImageQueryBuilder.buildQueries(restReq);
  assert(restQueries[0] === 'Olive Bar Kitchen New Delhi restaurant', `Restaurant query generated correctly ("${restQueries[0]}")`);

  const cacheKey = ImageQueryBuilder.buildCacheKey('hotel', 'Taj Palace', 'New Delhi');
  assert(cacheKey === 'images:hotel:taj-palace-new-delhi', `Cache key generated as expected: "${cacheKey}"`);

  // ── 2. ImageCache Tests ─────────────────────────────────────────────────────
  console.log('\n--- 2. Testing ImageCache ---');

  ImageCache.clearLocalMemory();
  const testKey = 'images:hotel:test-hotel-delhi';
  const dummyResponse: any = {
    success: true,
    source: 'unsplash',
    cached: false,
    images: [
      {
        id: 'test-1',
        regular: 'https://example.com/regular.jpg',
        small: 'https://example.com/small.jpg',
        thumb: 'https://example.com/thumb.jpg',
        photographer: 'Test User',
        photographerUrl: 'https://unsplash.com/@test',
        description: 'Test hotel photo',
        color: '#ffffff',
        width: 1920,
        height: 1080,
      },
    ],
  };

  await ImageCache.set(testKey, dummyResponse, 60);
  const retrieved = await ImageCache.get(testKey);
  assert(retrieved !== null && retrieved.cached === true, 'ImageCache retrieves stored entry with cached=true');
  assert(retrieved?.images[0]?.id === 'test-1', 'ImageCache preserves image payload details');

  // ── 3. ImageService End-to-End Search & Fallback Tests ────────────────────
  console.log('\n--- 3. Testing ImageService End-to-End ---');

  const searchResult = await ImageService.searchImages({
    entityName: 'Ritz Paris',
    entityType: 'hotel',
    city: 'Paris',
    country: 'France',
    count: 3,
  });

  assert(searchResult.success === true, 'ImageService search returned success=true');
  assert(searchResult.images.length >= 3, `ImageService returned ${searchResult.images.length} images (>= 3 required)`);
  assert(searchResult.images[0].regular !== undefined, 'ImageObject contains regular URL');
  assert(searchResult.images[0].small !== undefined, 'ImageObject contains small URL');
  assert(searchResult.images[0].thumb !== undefined, 'ImageObject contains thumb URL');

  // Test Restaurant Search
  const restSearchResult = await ImageService.searchImages({
    entityName: 'Bukhara',
    entityType: 'restaurant',
    city: 'New Delhi',
    country: 'India',
    count: 3,
  });
  assert(restSearchResult.success === true && restSearchResult.images.length >= 3, `Restaurant search resolved ${restSearchResult.images.length} images from source "${restSearchResult.source}"`);

  console.log('\n==================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('==================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('💥 Test execution error:', err);
  process.exit(1);
});
