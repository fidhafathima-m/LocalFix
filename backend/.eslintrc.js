module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  plugins: ["@typescript-eslint", "import", "prettier"],
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:prettier/recommended",
  ],
  rules: {
    // TypeScript specific rules
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-inferrable-types": "error",
    "@typescript-eslint/prefer-const": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-return": "error",
    "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "@typescript-eslint/prefer-as-const": "error",

    // Import rules
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
          "object",
          "type",
        ],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
    "import/no-unresolved": "error",
    "import/no-cycle": "error",
    "import/no-default-export": "error",
    "import/no-duplicates": "error",

    // General ESLint rules
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-duplicate-imports": "error",
    "no-unused-vars": "off", // Handled by TypeScript
    "prefer-const": "error",
    "prefer-template": "error",
    "object-shorthand": "error",
    "no-var": "error",
    eqeqeq: ["error", "always"],
    curly: ["error", "all"],
    "no-return-await": "error",
    "require-await": "error",

    // Prettier
    "prettier/prettier": "error",
  },
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: "./tsconfig.json",
      },
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
  overrides: [
    // Configuration files
    {
      files: ["*.config.js", "*.config.ts"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
        "import/no-default-export": "off",
      },
    },
    // Test files
    {
      files: ["**/__tests__/**", "**/*.test.ts", "**/*.spec.ts"],
      env: {
        jest: true,
      },
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
      },
    },
    // Controller files - allow error: any for Express error handling
    {
      files: ["**/*Controller.ts"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
      },
    },
  ],
  ignorePatterns: [
    "dist/",
    "build/",
    "node_modules/",
    "*.js",
    "coverage/",
    "*.d.ts",
    "!.prettierrc.js",
  ],
};
