import { describe, it, expect } from 'vitest';
import remarkInlineCode from './remark-inline-code.mjs';

describe('remarkInlineCode plugin', () => {
  it('transforms recognized prefixes, unprefixed code, and preserves non-kind prefixes like std::vector', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'inlineCode', value: 'cls::MyList' },
            { type: 'inlineCode', value: 'fn::sort()' },
            { type: 'inlineCode', value: 'var::strategy' },
            { type: 'inlineCode', value: 'kw::private' },
            { type: 'inlineCode', value: 'const::null' },
            { type: 'inlineCode', value: 'str::"hola"' },
            { type: 'inlineCode', value: 'tag::div' },
            { type: 'inlineCode', value: 'attr::class' },
            { type: 'inlineCode', value: 'npm install' },
            { type: 'inlineCode', value: 'std::vector' },
          ],
        },
      ],
    };

    const transform = remarkInlineCode();
    transform(tree);

    const nodes = tree.children[0].children as Array<{
      type: string;
      value: string;
      data?: { hName?: string; hProperties?: { className?: string[] } };
    }>;

    // cls::MyList -> MyList with ic, ic-cls
    expect(nodes[0].value).toBe('MyList');
    expect(nodes[0].data?.hName).toBe('code');
    expect(nodes[0].data?.hProperties?.className).toEqual(['ic', 'ic-cls']);

    // fn::sort() -> sort() with ic, ic-fn
    expect(nodes[1].value).toBe('sort()');
    expect(nodes[1].data?.hProperties?.className).toEqual(['ic', 'ic-fn']);

    // var::strategy -> strategy with ic, ic-var
    expect(nodes[2].value).toBe('strategy');
    expect(nodes[2].data?.hProperties?.className).toEqual(['ic', 'ic-var']);

    // kw::private -> private with ic, ic-kw
    expect(nodes[3].value).toBe('private');
    expect(nodes[3].data?.hProperties?.className).toEqual(['ic', 'ic-kw']);

    // const::null -> null with ic, ic-const
    expect(nodes[4].value).toBe('null');
    expect(nodes[4].data?.hProperties?.className).toEqual(['ic', 'ic-const']);

    // str::"hola" -> "hola" with ic, ic-str
    expect(nodes[5].value).toBe('"hola"');
    expect(nodes[5].data?.hProperties?.className).toEqual(['ic', 'ic-str']);

    // tag::div -> div with ic, ic-tag
    expect(nodes[6].value).toBe('div');
    expect(nodes[6].data?.hProperties?.className).toEqual(['ic', 'ic-tag']);

    // attr::class -> class with ic, ic-attr
    expect(nodes[7].value).toBe('class');
    expect(nodes[7].data?.hProperties?.className).toEqual(['ic', 'ic-attr']);

    // npm install -> untouched value with ic
    expect(nodes[8].value).toBe('npm install');
    expect(nodes[8].data?.hProperties?.className).toEqual(['ic']);

    // std::vector -> untouched value with ic
    expect(nodes[9].value).toBe('std::vector');
    expect(nodes[9].data?.hProperties?.className).toEqual(['ic']);
  });
});
