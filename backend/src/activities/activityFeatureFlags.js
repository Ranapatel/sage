/**
 * Activity Feature Flags Utility
 *
 * Provides central gates for:
 *   - ACTIVITIES_BOOKING_ENABLED
 *   - ACTIVITIES_CACHE_SEARCH_ENABLED
 *   - ACTIVITIES_CONTENT_SYNC_ENABLED
 *   - ACTIVITIES_CACHE_SYNC_ENABLED
 */

function isFeatureEnabled(flagName, defaultValue = false) {
  const envVal = process.env[flagName];
  if (envVal === undefined) return defaultValue;
  return envVal === 'true';
}

function featureGate(flagName, defaultValue = false) {
  return (req, res, next) => {
    if (!isFeatureEnabled(flagName, defaultValue)) {
      return res.status(503).json({
        success: false,
        error: `Service feature '${flagName}' is disabled in this environment.`
      });
    }
    next();
  };
}

module.exports = {
  isFeatureEnabled,
  featureGate
};
