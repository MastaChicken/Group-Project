import { defineConfig } from "vite";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";
import checker from "vite-plugin-checker";
import EnvironmentPlugin from "vite-plugin-environment";
import template from "rollup-plugin-html-literals";

/**
 * @type {import('vite').UserConfig}
 */
export default defineConfig({
  plugins: [
    template(),
    checker({
      typescript: true,
      eslint: { lintCommand: 'eslint "./src/**/*.{js,ts}"' },
    }),
    EnvironmentPlugin({
      // Required: will fail if the API_URL environment variable is not provided.
      API_URL: undefined,
    }),
      viteStaticCopy({
        targets: [
          {
            src: resolve(__dirname, "assets"),
            dest: resolve(__dirname, "dist"),
          },
        ],
      }),
  ],
  build: {
    minify: true,
    manifest: true,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
      output: {
        manualChunks: {
          wordcloud: ["wordcloud"],
          pdfjs: ["pdfjs-dist"],
          navaid: ["navaid"],
          shoelace: ["@shoelace-style/shoelace"],
        },
      },
    },
  },
});
