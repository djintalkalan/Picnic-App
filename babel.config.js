module.exports = (api) => {
  const babelEnv = api.env();
  const moduleResolverPlugin = [
    'module-resolver',
    {
      root: ['./'],
      extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
      alias: {
        "assets": "./src/assets",
        "analytics": "./src/analytics/AnalyticService.ts",
        "intercom": "./src/intercom/IntercomService.ts",
        "app-store": "./src/redux",
        "rollbar-service": "./src/rollbar",
        "api": "./src/api",
        "codepush": "./src/codepush/CodePush.tsx",
        "custom-components": "./src/components",
        "database": "./src/database/Database.ts",
        "screens": "./src/screens",
        "socket": "./src/socket",
        "utils": "./src/utils",
      }
    }
  ]
  const inlineImportPlugin = [
    "babel-plugin-inline-import",
    {
      "extensions": [".svg"]
    }
  ]

  const plugins = [
    inlineImportPlugin,
    moduleResolverPlugin,
  ]
  if (babelEnv !== 'development') {
    plugins.push(['transform-remove-console']);
  }
  return {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
      ...plugins,
      'react-native-reanimated/plugin'
    ],
    ignore: [
      "node_modules/aws-sdk/dist/aws-sdk-react-native.js"
    ]
  }
};
