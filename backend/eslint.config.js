import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import importPlugin from "eslint-plugin-import"; // ✅ Correct import

// Add this setting in .vscode/settings.json to auto-fix errors on save:
// {
//   "editor.codeActionsOnSave": {
//     "source.fixAll.eslint": true
//   }
// }


// 1️⃣ You can run ESLint manually (npm run lint).
// 2️⃣ But in big companies, it's automated through:

// VS Code & IDEs → Real-time linting while writing code.
// Git Hooks → Runs before commits.
// CI/CD Pipelines → Runs on pull requests before merging.
// Build Systems → Runs when building the project.

// ✅ (B) ESLint in Git Hooks (Pre-Commit)
// In MNCs, companies use Git Hooks (like Husky or lint-staged) to run ESLint before committing code.
// This prevents bad code from being pushed to Git.
// 👉 Setup Example:

// Install Husky and lint-staged:
// npm install husky lint-staged --save-dev
// Add a pre-commit hook in package.json:
// {
//   "husky": {
//     "hooks": {
//       "pre-commit": "lint-staged"
//     }
//   },
//   "lint-staged": {
//     "**/*.js": ["eslint --fix", "git add"]
//   }
// }
// 🔹 Result: ESLint automatically runs and fixes errors before every commit.

// 💡 Final Verdict

// ✅ Auto-fix style issues (indentation, spacing, quotes, semicolons).
// ❌ Don't auto-fix logic-related rules (eqeqeq, arrow-body-style, no-console).
// 📌 Use ESLint for code quality, Prettier for formatting.

// 🚀 This ensures clean, readable code without breaking functionality!

export default defineConfig([
  {
    ignores: ["node_modules", "dist", "build", ".git", "env", "**/._*"], // ✅ Ignore macOS metadata files
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: globals.browser,
      sourceType: "module",
      ecmaVersion: "latest",
    },
    plugins: {
      js,
      import: importPlugin, // ✅ Properly registered as an object
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "eqeqeq": "error",
      "curly": "error",
      "semi": ["off", "always"],
      "quotes": ["error", "double"],
      "indent": ["off", 2],
      "comma-dangle": ["error", "always-multiline"],
      "arrow-body-style": ["error", "as-needed"],
      "prefer-const": "error",
      "no-var": "error",
      "no-async-promise-executor":"error",
      "no-return-await": "error",
      "import/no-commonjs": "error",
      "import/order": ["error", { "groups": ["builtin", "external", "internal"] }],
      "import/no-unresolved": "warn", // ✅ Prevents broken/missing imports
      "import/no-duplicates": "error", // ✅ Avoids duplicate imports
      "import/no-extraneous-dependencies": "error", // ✅ Ensures packages are listed in package.json
      "import/no-self-import": "error", // ✅ Prevents importing the same module into itself
        // "import/no-default-export": "error",
      // "import/extensions": ["error",{"js":"always","jsx": "never", "ts": "never", "tsx": "never" }], // ✅ Enforces clean imports without extensions for react and ts 
    
    
      // "import/no-duplicates": "error",
      // "import/no-extraneous-dependencies": "error",
      // "import/no-named-as-default-member": "error",
      // "import/no-named-as-default": "error",
      // "import/no-named-default": "error",
      // "import/no-named-export": "error",
      // "import/no-self-import": "error",
      // "import/no-unused-imports": "error",
      // "import/prefer-default-export": "error",
      // "import/newline-after-import": "error",
      // "import/no-unresolved": "error",
      // "import/no-unused-modules": "error",
      // "import/unambiguous": "error",
      // "import/extensions": ["error", { "js": "never", "jsx": "never", "ts": "never", "tsx": "never" }],
      // "import/no-dynamic-require": "error",
      // "import/no-default-export": "error",
      // "import/no-named-as-default-member": "error",
      // "import/no-named-as-default": "error",
      // "import/no-named-default": "error",
    },
  },
]);
