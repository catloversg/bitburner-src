module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    // "plugin:@typescript-eslint/recommended-type-checked"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  plugins: [
    "@typescript-eslint",
  ],
  root: true,
  reportUnusedDisableDirectives: true,
  ignorePatterns: [
    "dist/**",
    "dist-*/**",
    "libs/**",
  ],
  overrides: [
    {
      files: [
        "**/*.ts",
      ],
      rules: {
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-unused-vars": "warn",
        "no-constant-condition": "off",
      },
    },
  ],
};
