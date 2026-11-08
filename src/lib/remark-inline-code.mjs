const VALID_KINDS = new Set(['cls', 'fn', 'var', 'kw', 'const', 'str', 'tag', 'attr']);

/**
 * Remark plugin to transform mdast `inlineCode` nodes.
 *
 * For values starting with a recognized prefix (`cls::`, `fn::`, etc.),
 * the prefix is stripped from the value and CSS classes `["ic", "ic-<kind>"]`
 * are applied via `hProperties`.
 *
 * Unprefixed code (or prefixes not in the list, like `std::vector`) retain their
 * original value, and are assigned `["ic"]`.
 */
export default function remarkInlineCode() {
  return (tree) => {
    function visit(node) {
      if (!node) return;

      if (node.type === 'inlineCode' && typeof node.value === 'string') {
        const match = node.value.match(/^([a-z]+)::(.*)$/s);

        node.data = node.data || {};
        node.data.hName = 'code';

        if (match && VALID_KINDS.has(match[1])) {
          const kind = match[1];
          node.value = match[2];
          node.data.hProperties = {
            ...(node.data.hProperties || {}),
            className: ['ic', `ic-${kind}`],
          };
        } else {
          node.data.hProperties = {
            ...(node.data.hProperties || {}),
            className: ['ic'],
          };
        }
      }

      if (node.children && Array.isArray(node.children)) {
        for (let i = 0; i < node.children.length; i++) {
          visit(node.children[i]);
        }
      }
    }

    visit(tree);
  };
}
