const path = require('path');
/**
 * Next.js configuration for the Finora app.
 * Sets the outputFileTracingRoot to the app directory to avoid warnings
 * when multiple lockfiles exist in the repository (e.g., at the workspace root).
 */
module.exports = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  // Add other custom Next.js options here.
};
