<script lang="ts">
  type HighlightName = 'taskTodo' | 'taskDone' | 'heading' | 'bold' | 'italic' | 'bullet' | 'code';
  type HighlightMatch = { start: number; end: number };
  type SelectionOffsets = { start: number; end: number; direction: 'forward' | 'backward' };

  const HIGHLIGHT_NAMES: HighlightName[] = [
    'taskTodo',
    'taskDone',
    'heading',
    'bold',
    'italic',
    'bullet',
    'code',
  ];

  let { content = $bindable() }: { content: string } = $props();

  let editor: HTMLDivElement | undefined = $state();

  const normalize = (text: string) => text.replace(/\r\n?/g, '\n').replaceAll('\u00a0', ' ');

  const collectMatches = (text: string): Record<HighlightName, HighlightMatch[]> => {
    const matches: Record<HighlightName, HighlightMatch[]> = {
      taskTodo: [],
      taskDone: [],
      heading: [],
      bold: [],
      italic: [],
      bullet: [],
      code: [],
    };

    const add = (name: HighlightName, start: number, end: number) => {
      if (end > start) matches[name].push({ start, end });
    };

    const overlaps = (start: number, end: number, ranges: HighlightMatch[]) =>
      ranges.some((r) => start < r.end && r.start < end);

    const lines = text.split('\n');
    let lineStart = 0;
    let codeFence: '`' | '~' | undefined;

    for (const line of lines) {
      const lineEnd = lineStart + line.length;
      const fenceMatch = line.match(/^\s*(```+|~~~+)/);

      if (codeFence) {
        add('code', lineStart, lineEnd);
        if (fenceMatch && fenceMatch[1][0] == codeFence) codeFence = undefined;
        lineStart = lineEnd + 1;
        continue;
      }

      if (fenceMatch) {
        add('code', lineStart, lineEnd);
        codeFence = fenceMatch[1][0] as '`' | '~';
        lineStart = lineEnd + 1;
        continue;
      }

      if (line.length > 0) {
        if (/^\s{0,3}#{1,6}[ \t]+\S/.test(line)) add('heading', lineStart, lineEnd);

        const bulletMatch = line.match(/^(\s*)(?:[-+*]|\d+\.)[ \t]+/);
        if (bulletMatch)
          add('bullet', lineStart + bulletMatch[1].length, lineStart + bulletMatch[0].length);

        const taskMatch = line.match(/^(\s*(?:[-+*]|\d+\.)[ \t]+)(\[( |x|X)\])/);
        if (taskMatch) {
          const start = lineStart + taskMatch[1].length;
          const end = start + taskMatch[2].length;
          add(taskMatch[3] == ' ' ? 'taskTodo' : 'taskDone', start, end);
        }

        for (const m of line.matchAll(/`[^`\n]+`/g))
          add('code', lineStart + m.index!, lineStart + m.index! + m[0].length);

        for (const m of line.matchAll(/(\*\*|__)(?=\S)([^\n]*?\S)\1/g)) {
          const [start, end] = [lineStart + m.index!, lineStart + m.index! + m[0].length];
          if (!overlaps(start, end, matches.code)) add('bold', start, end);
        }

        for (const m of line.matchAll(
          /(?<!\*)\*(?=\S)([^*\n]*?\S)\*(?!\*)|(?<!_)_(?=\S)([^_\n]*?\S)_(?!_)/g,
        )) {
          const [start, end] = [lineStart + m.index!, lineStart + m.index! + m[0].length];
          if (!overlaps(start, end, matches.code) && !overlaps(start, end, matches.bold))
            add('italic', start, end);
        }
      }

      lineStart = lineEnd + 1;
    }

    return matches;
  };

  // plaintext-only contenteditable always has at most one Text node child
  const getTextNode = (root: HTMLDivElement) =>
    root.firstChild instanceof Text ? root.firstChild : null;

  const getSelectionOffsets = (root: HTMLDivElement): SelectionOffsets | undefined => {
    const sel = document.getSelection();
    if (!sel || sel.rangeCount == 0 || !sel.anchorNode || !sel.focusNode) return;
    if (!root.contains(sel.anchorNode) || !root.contains(sel.focusNode)) return;

    const measureTo = (node: Node, offset: number) => {
      const r = new Range();
      r.selectNodeContents(root);
      r.setEnd(node, offset);
      return normalize(r.toString()).length;
    };

    const anchor = measureTo(sel.anchorNode, sel.anchorOffset);
    const focus = measureTo(sel.focusNode, sel.focusOffset);

    return anchor <= focus
      ? { start: anchor, end: focus, direction: 'forward' }
      : { start: focus, end: anchor, direction: 'backward' };
  };

  const restoreSelection = (root: HTMLDivElement, offsets: SelectionOffsets | undefined) => {
    if (!offsets) return;
    const sel = document.getSelection();
    if (!sel) return;

    const node = getTextNode(root);
    if (!node) return;

    const max = node.data.length;
    const start = Math.min(offsets.start, max);
    const end = Math.min(offsets.end, max);

    if (offsets.direction == 'backward' && sel.extend) {
      sel.collapse(node, end);
      sel.extend(node, start);
    } else {
      const range = new Range();
      range.setStart(node, start);
      range.setEnd(node, end);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  const ensurePlainTextDom = (text: string) => {
    if (!editor) return;
    const node = getTextNode(editor);
    if (editor.childNodes.length <= 1 && node?.data == text) return;

    const offsets = document.activeElement == editor ? getSelectionOffsets(editor) : undefined;
    editor.textContent = text;
    restoreSelection(editor, offsets);
  };

  const syncHighlights = (text: string) => {
    if (!editor) return;

    const node = getTextNode(editor);
    if (!node) {
      for (const name of HIGHLIGHT_NAMES) CSS.highlights.delete(name);
      return;
    }

    const matches = collectMatches(text);

    for (const name of HIGHLIGHT_NAMES) {
      const highlight = new Highlight();
      for (const { start, end } of matches[name]) {
        if (end <= start) continue;
        const range = new Range();
        range.setStart(node, start);
        range.setEnd(node, end);
        highlight.add(range);
      }
      CSS.highlights.set(name, highlight);
    }
  };

  $effect(() => {
    if (!editor) return;
    const text = normalize(content);
    ensurePlainTextDom(text);
    syncHighlights(text);
  });

  $effect(() => () => {
    for (const name of HIGHLIGHT_NAMES) CSS.highlights.delete(name);
  });
</script>

<div
  bind:this={editor}
  data-placeholder={normalize(content).trim().length == 0 ? 'Write something, anything' : undefined}
  class="editor"
  contenteditable="plaintext-only"
  spellcheck="false"
  oninput={() => editor && (content = normalize(editor.innerText))}
></div>

<style>
  .editor {
    @apply --m3-focus-none;
    width: min(100%, 51rem);
    align-self: center;
    flex-grow: 1;
    padding-block: var(--choose-height);
    padding-inline: 0.5rem;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    font-feature-settings: 'calt' 0;
    position: relative;
  }
  .editor[data-placeholder]::before {
    position: absolute;
    content: attr(data-placeholder);
    color: var(--m3c-on-surface-variant);
  }

  :global(::highlight(heading)),
  :global(::highlight(bold)) {
    text-shadow:
      0.02em 0 currentColor,
      -0.02em 0 currentColor;
  }
  :global(::highlight(heading)) {
    color: var(--m3c-secondary);
  }
  :global(::highlight(bold)) {
    color: light-dark(#000, #fff);
  }
  :global(::highlight(italic)),
  :global(::highlight(bullet)) {
    color: var(--m3c-on-surface-variant);
  }
  :global(::highlight(taskTodo)) {
    color: var(--m3c-on-surface-variant);
  }
  :global(::highlight(taskDone)) {
    color: --translucent(var(--m3c-on-primary), 0.2);
    background-color: var(--m3c-primary);
  }
  :global(::highlight(code)) {
    color: var(--m3c-on-tertiary-container-subtle);
    background-color: var(--m3c-tertiary-container-subtle);
  }
</style>
