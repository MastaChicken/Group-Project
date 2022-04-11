import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import EnvironmentPlugin from "vite-plugin-environment";

/**
 * @type {import('vite').UserConfig}
 */
export default defineConfig({
  plugins: [
    checker(
      { typescript: true },
      { eslint: { lintCommand: 'eslint"./src/**/*.{js,ts}"' } }
    ),
    EnvironmentPlugin({
      // Uses 'development' if the NODE_ENV environment variable is not defined.
      NODE_ENV: "development",
    }),
  ],
  build: {
    minify: true,
  },
});
