const parse = require('json-to-ast')

interface JsonPropertyLocation {
  path: string
  line: number
  column: number
}

type JsonAst = JsonAstLiteral | JsonAstObject | JsonAstArray

interface JsonAstLocation {
  start: {
    line: number
    column: number
    offset: number
  }
  end: {
    line: number
    column: number
    offset: number
  }
  source: null | string
}

interface JsonAstIdentifier {
  type: 'Identifier'
  value: string
  raw: string
  loc: JsonAstLocation
}

interface JsonAstObjectProperty {
  type: 'Property'
  key: JsonAstIdentifier
  value: JsonAst
  loc: JsonAstLocation
}

interface JsonAstLiteral {
  type: 'Literal'
  value: string | number | boolean | any
  raw: string
  loc: JsonAstLocation
}

interface JsonAstObject {
  type: 'Object'
  children: Array<JsonAstObjectProperty>
  loc: JsonAstLocation
}

interface JsonAstArray {
  type: 'Array'
  children: Array<JsonAst>
  loc: JsonAstLocation
}

function jsonToPropertyPaths(ast: JsonAst, previousPath: Array<string> = []): Array<JsonPropertyLocation> {
  let children: Array<Array<JsonPropertyLocation>> = []
  if (ast.type === 'Literal') {
    return [{
      path: previousPath.join('.'),
      line: ast.loc.start.line,
      column: ast.loc.start.column,
    }]
  } else if (ast.type === 'Array') {
    children = ast.children.map((value, idx) => jsonToPropertyPaths(value, previousPath.slice().concat([String(idx)])))
  } else if (ast.type === 'Object') {
    children = ast.children.map(property => jsonToPropertyPaths(property.value, previousPath.slice().concat([property.key.value])))
  }

  return children.reduce((a, b) => a.concat(b), [])
}

export function parseJson(formattedJson: string): Array<JsonPropertyLocation> {
  return jsonToPropertyPaths((parse(formattedJson) as JsonAst), [])
}