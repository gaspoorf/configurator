const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = [
  'js',
  'jsx',
  'json',
  'ts',
  'tsx',
  'cjs',
  'mjs',
];

config.resolver.assetExts = [
  'glb',
  'gltf',
  'png',
  'jpg',
  'ttf',
];

module.exports = config;