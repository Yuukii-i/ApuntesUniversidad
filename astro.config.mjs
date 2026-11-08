import { defineConfig } from 'astro/config';
import astroExpressiveCode from 'astro-expressive-code';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import preact from '@astrojs/preact';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkMermaid from './src/lib/remark-mermaid.mjs';
import remarkInlineCode from './src/lib/remark-inline-code.mjs';

const site = process.env.SITE_URL || 'https://localhost';
const base = process.env.BASE_PATH || '/';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  markdown: {
    remarkPlugins: [remarkInlineCode, remarkMermaid, remarkMath],
    rehypePlugins: [rehypeKatex],
  },
  integrations: [
    astroExpressiveCode({
      themes: ['github-dark', 'github-light'],
      themeCssSelector: (theme) => {
        if (theme.name === 'github-light') return ':root[data-theme="light"]';
        return ':root';
      },
      styleOverrides: {
        codeFontFamily: '"JetBrains Mono Variable", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        borderRadius: '0.75rem',
        borderWidth: '0px',
        borderColor: 'transparent',
        frames: {
          frameBoxShadowCssValue: 'none',
        },
      },
    }),
    mdx(),
    tailwind({
      applyBaseStyles: true,
    }),
    preact(),
  ],
});
