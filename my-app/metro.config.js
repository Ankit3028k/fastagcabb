const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable bundle splitting and optimization
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    mangle: {
      keep_fnames: true,
    },
    output: {
      ascii_only: true,
      quote_style: 3,
      wrap_iife: true,
    },
    sourceMap: false,
    toplevel: false,
    warnings: false,
    parse: {
      bare_returns: false,
    },
  },
};

// Optimize resolver
config.resolver = {
  ...config.resolver,
  alias: {
    // Remove unused modules
    'react-native-web': false,
    'react-dom': false,
  },
};

module.exports = config;
