export default function remarkMermaid() {
  return (tree) => {
    function visit(node, index, parent) {
      if (!node) return;
      if (node.type === 'code' && node.lang === 'mermaid') {
        if (parent && typeof index === 'number') {
          parent.children[index] = {
            type: 'html',
            value: `<pre class="mermaid">${node.value}</pre>`,
          };
        }
      }
      if (node.children && Array.isArray(node.children)) {
        for (let i = 0; i < node.children.length; i++) {
          visit(node.children[i], i, node);
        }
      }
    }
    visit(tree, 0, null);
  };
}
