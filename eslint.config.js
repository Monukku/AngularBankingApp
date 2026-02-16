// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  // Ignore patterns - exclude files from linting
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.angular/**",        // Angular cache (causing many errors)
      "**/coverage/**",
      "**/cypress.config.ts",  // Cypress config
      "**/*.spec.ts",          // Test files (optional)
    ],
  },
  
  // TypeScript files configuration
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      
      // Relaxed rules for better developer experience
      "@typescript-eslint/no-explicit-any": "warn",           // Warn instead of error for 'any'
      "@typescript-eslint/no-inferrable-types": "off",        // Allow explicit simple types
      "@typescript-eslint/no-empty-function": "warn",         // Warn about empty functions
      "@typescript-eslint/no-unused-vars": [
        "error", 
        { 
          "argsIgnorePattern": "^_",                          // Allow _unused variables
          "varsIgnorePattern": "^_"
        }
      ],
      "@angular-eslint/prefer-inject": "warn",                // Warn about old constructor injection
      "@angular-eslint/no-empty-lifecycle-method": "warn",    // Warn about empty lifecycle methods
      "@typescript-eslint/no-wrapper-object-types": "warn",   // Warn about Object vs object
      "@typescript-eslint/no-namespace": "warn",              // Warn about namespaces
    },
  },
  
  // HTML template files configuration
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {
      "@angular-eslint/template/prefer-control-flow": "warn",  // Warn about old *ngIf syntax
      "@angular-eslint/template/no-negated-async": "warn",     // Warn about negated async
      "@angular-eslint/template/elements-content": "warn",     // Warn about empty elements
      "@angular-eslint/template/label-has-associated-control": "warn", // Accessibility warning
      "@angular-eslint/template/click-events-have-key-events": "warn", // Accessibility warning
      "@angular-eslint/template/interactive-supports-focus": "warn",   // Accessibility warning
    },
  },
]);