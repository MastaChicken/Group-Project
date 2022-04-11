import checker from "vite-plugin-checker";

/**
 * @type {import('vite').UserConfig}
 */
export default {
  plugins: [
    checker(
      { typescript: true },
      { eslint: { lintCommand: 'eslint"./src/**/*.{js,ts}"' } }
    ),
  ],
  build: {
    minify: true,
  },
};
