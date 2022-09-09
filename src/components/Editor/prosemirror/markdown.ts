import markdownit from 'markdown-it'
import type Token from 'markdown-it/lib/token'
import { MarkdownSerializer, MarkdownParser, defaultMarkdownSerializer } from 'prosemirror-markdown'
import type { Node, Schema } from 'prosemirror-model'
import type { EditorState } from 'prosemirror-state'

function findAlignment(cell: Node): string | null {
  const alignment = cell.attrs.style as string

  if (!alignment) {
    return null
  }

  const match = alignment.match(/text-align: ?(left|right|center)/)

  if (match && match[1]) {
    return match[1]
  }

  return null
}

export const markdownSerializer = new MarkdownSerializer(
  {
    ...defaultMarkdownSerializer.nodes,
    image(state, node) {
      const alt = state.esc(node.attrs.alt || '')
      const src = node.attrs.path ?? node.attrs.src

      // FIXME !!!!!!!!!
      // const title = node.attrs.title ? state.quote(node.attrs.title) : undefined
      const title = node.attrs.title

      state.write(`![${alt}](${src}${title || ''})\n`)
    },
    code_block(state, node) {
      const src = node.attrs.params.src

      if (src) {
        const title = state.esc(node.attrs.params.title || '')

        state.write(`![${title}](${src})\n`)

        return
      }

      state.write(`\`\`\`${node.attrs.params.lang || ''}\n`)
      state.text(node.textContent, false)
      state.ensureNewLine()
      state.write('```')
      state.closeBlock(node)
    },
    todo_item(state, node) {
      state.write(`${node.attrs.done ? '[x]' : '[ ]'} `)
      state.renderContent(node)
    },
    table(state, node) {
      function serializeTableHead(head: Node) {
        let columnAlignments: string[] = []

        head.forEach((headRow) => {
          if (headRow.type.name === 'table_row') {
            columnAlignments = serializeTableRow(headRow)
          }
        })

        // write table header separator
        for (const alignment of columnAlignments) {
          state.write('|')
          state.write(alignment === 'left' || alignment === 'center' ? ':' : ' ')
          state.write('---')
          state.write(alignment === 'right' || alignment === 'center' ? ':' : ' ')
        }

        state.write('|')
        state.ensureNewLine()
      }

      function serializeTableBody(body: Node) {
        body.forEach((bodyRow) => {
          if (bodyRow.type.name === 'table_row') {
            serializeTableRow(bodyRow)
          }
        })
        state.ensureNewLine()
      }

      function serializeTableRow(row: Node): string[] {
        const columnAlignment: string[] = []

        row.forEach((cell) => {
          if (cell.type.name === 'table_header' || cell.type.name === 'table_cell') {
            const alignment = serializeTableCell(cell)

            columnAlignment.push(alignment)
          }
        })
        state.write('|')
        state.ensureNewLine()

        return columnAlignment
      }

      function serializeTableCell(cell: Node): string | null {
        state.write('| ')
        state.renderInline(cell)
        state.write(' ')

        return findAlignment(cell)
      }

      node.forEach((table_child) => {
        if (table_child.type.name === 'table_head') serializeTableHead(table_child)

        if (table_child.type.name === 'table_body') serializeTableBody(table_child)
      })

      state.ensureNewLine()
      state.write('\n')
    }
  },
  {
    ...defaultMarkdownSerializer.marks,
    strikethrough: {
      open: '~~',
      close: '~~',
      mixable: true,
      expelEnclosingWhitespace: true
    }
  }
)

export const serialize = (state: EditorState) => {
  // eslint-disable-next-line no-use-before-define
  let text = markdownSerializer.serialize(state.doc)

  if (text.charAt(text.length - 1) !== '\n') {
    text += '\n'
  }

  return text
}

function listIsTight(tokens: any[], i: number) {
  for (let index = i + 1; i < tokens.length; index++) {
    if (tokens[index].type !== 'list_item_open') {
      return tokens[i].hidden
    }
  }

  return false
}

const md = markdownit({ html: false })

export const createMarkdownParser = (schema: Schema) =>
  new MarkdownParser(schema, md, {
    table: { block: 'table' },
    thead: { block: 'table_head' },
    tbody: { block: 'table_body' },
    th: {
      block: 'table_header',
      getAttrs: (tok) => ({
        style: tok.attrGet('style')
      })
    },
    tr: { block: 'table_row' },
    td: {
      block: 'table_cell',
      getAttrs: (tok) => ({
        style: tok.attrGet('style')
      })
    },
    blockquote: { block: 'blockquote' },
    paragraph: { block: 'paragraph' },
    list_item: { block: 'list_item' },
    bullet_list: {
      block: 'bullet_list',
      getAttrs: (_: Token, tokens: Token[], i: number): Record<string, any> => ({
        tight: listIsTight(tokens, i)
      })
    },
    ordered_list: {
      block: 'ordered_list',
      getAttrs: (tok: Token, tokens: Token[], i: number): Record<string, any> => ({
        order: Number(tok.attrGet('start')) || 1,
        tight: listIsTight(tokens, i)
      })
    },
    heading: {
      block: 'heading',
      getAttrs: (tok) => ({ level: Number(tok.tag.slice(1)) })
    },
    code_block: {
      block: 'code_block',
      noCloseToken: true
    },
    fence: {
      block: 'code_block',
      getAttrs: (tok) => ({ params: { lang: tok.info } }),
      noCloseToken: true
    },
    hr: { node: 'horizontal_rule' },
    image: {
      node: 'image',
      getAttrs: (tok: any) => ({
        src: tok.attrGet('src'),
        title: tok.attrGet('title') || null,
        alt: (tok.children[0] && tok.children[0].content) || null
      })
    },
    hardbreak: { node: 'hard_break' },
    em: { mark: 'em' },
    strong: { mark: 'strong' },
    s: { mark: 'strikethrough' },
    link: {
      mark: 'link',
      getAttrs: (tok) => ({
        href: tok.attrGet('href'),
        title: tok.attrGet('title') || null
      })
    },
    code_inline: { mark: 'code', noCloseToken: true }
  })
