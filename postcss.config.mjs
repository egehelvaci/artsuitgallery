import postcssImport from 'postcss-import';

export default {
  plugins: {
    'postcss-import': {},
    '@tailwindcss/postcss': {
      config: './tailwind.config.mjs',
    },
    autoprefixer: {},
  },
};
