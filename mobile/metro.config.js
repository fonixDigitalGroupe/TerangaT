// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// SDK 54 active « package exports » par défaut ; le build ESM du package
// `entities` (tiré par react-native-svg) a des chemins que Metro ne résout pas.
// On revient à la résolution classique (champ main / CommonJS).
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
