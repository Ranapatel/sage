/**
 * Intelligent Image Query Builder & Slug Utility
 */
class ImageQueryBuilder {
  /**
   * Generates a prioritized list of search queries based on entity type and location metadata.
   */
  static buildQueries(request) {
    const { entityName, entityType, city, country } = request;
    const cleanName = ImageQueryBuilder.cleanString(entityName);
    const cleanCity = ImageQueryBuilder.cleanString(city);
    const cleanCountry = country ? ImageQueryBuilder.cleanString(country) : '';

    const queries = [];

    switch (entityType) {
      case 'hotel':
        if (cleanName && cleanCity && cleanCountry) {
          queries.push(`${cleanName} ${cleanCity} ${cleanCountry} hotel`);
        }
        if (cleanName && cleanCity) {
          queries.push(`${cleanName} ${cleanCity} hotel`);
        }
        if (cleanName) {
          queries.push(`${cleanName} hotel`);
        }
        if (cleanCity) {
          queries.push(`${cleanCity} luxury hotel`);
          queries.push(`${cleanCity} hotel`);
        }
        if (cleanCountry) {
          queries.push(`${cleanCountry} hotel`);
        }
        break;

      case 'restaurant':
        if (cleanName && cleanCity) {
          queries.push(`${cleanName} ${cleanCity} restaurant`);
        }
        if (cleanName) {
          queries.push(`${cleanName} restaurant`);
        }
        if (cleanCity) {
          queries.push(`${cleanCity} restaurant`);
        }
        break;

      case 'attraction':
        if (cleanName && cleanCity) {
          queries.push(`${cleanName} ${cleanCity}`);
        }
        if (cleanName) {
          queries.push(`${cleanName}`);
        }
        if (cleanCity) {
          queries.push(`${cleanCity} landmark`);
        }
        break;

      case 'beach':
        if (cleanName) {
          const suffix = cleanCountry || cleanCity;
          queries.push(`${cleanName} beach ${suffix}`.trim());
          queries.push(`${cleanName} beach`);
        }
        if (cleanCity) {
          queries.push(`${cleanCity} beach`);
        }
        break;

      case 'museum':
        if (cleanName && cleanCity) {
          queries.push(`${cleanName} ${cleanCity} museum`);
        }
        if (cleanName) {
          queries.push(`${cleanName} museum`);
        }
        if (cleanCity) {
          queries.push(`${cleanCity} museum`);
        }
        break;

      case 'park':
        if (cleanName && cleanCity) {
          queries.push(`${cleanName} ${cleanCity} park`);
        }
        if (cleanName) {
          queries.push(`${cleanName} park`);
        }
        if (cleanCity) {
          queries.push(`${cleanCity} park`);
        }
        break;

      case 'destination':
        const isIsland = cleanName.toLowerCase().includes('island') || cleanCity.toLowerCase().includes('island') || cleanCity.toLowerCase().includes('maldives') || cleanCity.toLowerCase().includes('bali');
        if (isIsland) {
          queries.push(`${cleanCity} ${cleanCountry} island`.trim());
        }
        queries.push(`${cleanCity} ${cleanCountry}`.trim());
        queries.push(`${cleanCity} travel`);
        if (cleanCountry) {
          queries.push(`${cleanCountry} travel`);
        }
        break;

      case 'general':
      default:
        if (cleanName && cleanCity) {
          queries.push(`${cleanName} ${cleanCity}`);
        }
        if (cleanName) {
          queries.push(`${cleanName}`);
        }
        if (cleanCity) {
          queries.push(`${cleanCity}`);
        }
        break;
    }

    // Deduplicate queries while preserving order
    return Array.from(new Set(queries.filter(q => q && q.trim().length > 0)));
  }

  /**
   * Generates a Redis cache key slug: images:{type}:{slug}
   * Example: images:hotel:taj-palace-new-delhi
   */
  static buildCacheKey(entityType, entityName, city) {
    const raw = `${entityName}-${city}`;
    const slug = raw
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return `images:${entityType}:${slug || 'default'}`;
  }

  /**
   * Clean string by removing special characters and excess whitespace
   */
  static cleanString(str) {
    if (!str) return '';
    return str
      .replace(/[_\-''`,.&!@#$%^*()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

module.exports = { ImageQueryBuilder }
module.exports.ImageQueryBuilder = ImageQueryBuilder
