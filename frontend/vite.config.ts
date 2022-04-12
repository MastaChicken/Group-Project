import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import EnvironmentPlugin from "vite-plugin-environment";

/**
 * @type {import('vite').UserConfig}
 */
export default defineConfig({
  plugins: [
    checker({
      typescript: true,
      eslint: { lintCommand: 'eslint "./src/**/*.{js,ts}"' },
    }),
    EnvironmentPlugin({
      // Required: will fail if the API_URL environment variable is not provided.
      API_URL: undefined,
    }),
  ],
  build: {
    minify: true,
  },
});
