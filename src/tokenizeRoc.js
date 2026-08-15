/**
 * @enum number
 */
export const State = {
  TopLevelContent: 1,
  InsideDoubleQuoteString: 2,
  InsideSingleQuoteString: 3,
  InsideTripleQuoteString: 4,
}

/**
 * @enum number
 */
export const TokenType = {
  None: 1,
  Whitespace: 2,
  Punctuation: 3,
  String: 4,
  Keyword: 5,
  KeywordControl: 6,
  KeywordReturn: 7,
  KeywordImport: 8,
  Numeric: 9,
  VariableName: 10,
  FunctionName: 11,
  Type: 12,
  LanguageConstant: 13,
  Comment: 14,
  Text: 15,
}

export const TokenMap = {
  [TokenType.None]: 'None',
  [TokenType.Whitespace]: 'Whitespace',
  [TokenType.Punctuation]: 'Punctuation',
  [TokenType.String]: 'String',
  [TokenType.Keyword]: 'Keyword',
  [TokenType.KeywordControl]: 'KeywordControl',
  [TokenType.KeywordReturn]: 'KeywordReturn',
  [TokenType.KeywordImport]: 'KeywordImport',
  [TokenType.Numeric]: 'Numeric',
  [TokenType.VariableName]: 'VariableName',
  [TokenType.FunctionName]: 'Function',
  [TokenType.Type]: 'Type',
  [TokenType.LanguageConstant]: 'LanguageConstant',
  [TokenType.Comment]: 'Comment',
  [TokenType.Text]: 'Text',
}

const RE_WHITESPACE = /^\s+/
const RE_LINE_COMMENT = /^#.*/
const RE_MULTILINE_STRING = /^\\\\.*/
const RE_TRIPLE_QUOTE = /^"""/
const RE_DOUBLE_QUOTE = /^"/
const RE_SINGLE_QUOTE = /^'/
const RE_STRING_DOUBLE_QUOTE_CONTENT = /^[^"\\]+/
const RE_STRING_SINGLE_QUOTE_CONTENT = /^[^'\\]+/
const RE_TRIPLE_QUOTE_CONTENT = /^(?:(?!""").)+/u
const RE_STRING_ESCAPE = /^\\(?:u\([0-9A-Fa-f]*\)|[nrt"'\\]|.)/
const RE_BACKSLASH = /^\\/
const RE_LANGUAGE_CONSTANT = /^(?:False|True)\b/
const RE_KEYWORD =
  /^(?:app|as|break|crash|dbg|else|expect|exposes|exposing|for|generates|has|hosted|if|implements|import|imports|in|interface|match|module|package|packages|platform|provides|requires|return|targets|var|where|while|with|and|or)\b/
const RE_NUMBER =
  /^(?:0[xX][0-9A-Fa-f](?:_?[0-9A-Fa-f])*|0[oO][0-7](?:_?[0-7])*|0[bB][01](?:_?[01])*|[0-9](?:_?[0-9])*(?:\.[0-9](?:_?[0-9])*)?(?:[eE][+-]?[0-9](?:_?[0-9])*)?)/
const RE_FUNCTION_NAME = /^(?:\$?[_a-z][A-Za-z0-9_$]*!?)(?=\s*(?:\(|=\s*\|))/
const RE_TYPE_NAME = /^[A-Z][A-Za-z0-9_$]*/
const RE_IDENTIFIER = /^\$?[_a-z][A-Za-z0-9_$]*!?/
const RE_PUNCTUATION =
  /^(?:\.\.<|\.\.=|->|=>|<-|!=|==|<=|>=|::|:=|\?\?|\.\.\.|\.\.|[()[\]{},.:+*=\-!&?\/\\%^<>|])+/u
const RE_ANY_CHARACTER = /^./u

export const initialLineState = {
  state: State.TopLevelContent,
}

export const hasArrayReturn = true

/**
 * @param {any} lineStateA
 * @param {any} lineStateB
 */
export const isEqualLineState = (lineStateA, lineStateB) => {
  return lineStateA.state === lineStateB.state
}

/**
 * @param {string} keyword
 */
const getKeywordToken = (keyword) => {
  switch (keyword) {
    case 'break':
    case 'else':
    case 'for':
    case 'if':
    case 'in':
    case 'match':
    case 'while':
      return TokenType.KeywordControl
    case 'return':
      return TokenType.KeywordReturn
    case 'import':
    case 'imports':
      return TokenType.KeywordImport
    default:
      return TokenType.Keyword
  }
}

/**
 * @param {string} line
 * @param {any} lineState
 */
export const tokenizeLine = (line, lineState) => {
  let index = 0
  let state = lineState.state
  const tokens = []
  while (index < line.length) {
    const part = line.slice(index)
    let next
    let token
    switch (state) {
      case State.TopLevelContent:
        if ((next = part.match(RE_WHITESPACE))) {
          token = TokenType.Whitespace
        } else if ((next = part.match(RE_LINE_COMMENT))) {
          token = TokenType.Comment
        } else if ((next = part.match(RE_MULTILINE_STRING))) {
          token = TokenType.String
        } else if ((next = part.match(RE_TRIPLE_QUOTE))) {
          token = TokenType.Punctuation
          state = State.InsideTripleQuoteString
        } else if ((next = part.match(RE_DOUBLE_QUOTE))) {
          token = TokenType.Punctuation
          state = State.InsideDoubleQuoteString
        } else if ((next = part.match(RE_SINGLE_QUOTE))) {
          token = TokenType.Punctuation
          state = State.InsideSingleQuoteString
        } else if ((next = part.match(RE_LANGUAGE_CONSTANT))) {
          token = TokenType.LanguageConstant
        } else if ((next = part.match(RE_KEYWORD))) {
          token = getKeywordToken(next[0])
        } else if ((next = part.match(RE_NUMBER))) {
          token = TokenType.Numeric
        } else if ((next = part.match(RE_FUNCTION_NAME))) {
          token = TokenType.FunctionName
        } else if ((next = part.match(RE_TYPE_NAME))) {
          token = TokenType.Type
        } else if ((next = part.match(RE_IDENTIFIER))) {
          token = TokenType.VariableName
        } else if ((next = part.match(RE_PUNCTUATION))) {
          token = TokenType.Punctuation
        } else if ((next = part.match(RE_ANY_CHARACTER))) {
          token = TokenType.Text
        } else {
          throw new Error('Failed to tokenize Roc source')
        }
        break
      case State.InsideDoubleQuoteString:
        if ((next = part.match(RE_DOUBLE_QUOTE))) {
          token = TokenType.Punctuation
          state = State.TopLevelContent
        } else if ((next = part.match(RE_STRING_DOUBLE_QUOTE_CONTENT))) {
          token = TokenType.String
        } else if ((next = part.match(RE_STRING_ESCAPE))) {
          token = TokenType.String
        } else if ((next = part.match(RE_BACKSLASH))) {
          token = TokenType.String
        } else {
          throw new Error('Failed to tokenize Roc string')
        }
        break
      case State.InsideSingleQuoteString:
        if ((next = part.match(RE_SINGLE_QUOTE))) {
          token = TokenType.Punctuation
          state = State.TopLevelContent
        } else if ((next = part.match(RE_STRING_SINGLE_QUOTE_CONTENT))) {
          token = TokenType.String
        } else if ((next = part.match(RE_STRING_ESCAPE))) {
          token = TokenType.String
        } else if ((next = part.match(RE_BACKSLASH))) {
          token = TokenType.String
        } else {
          throw new Error('Failed to tokenize Roc single-quote literal')
        }
        break
      case State.InsideTripleQuoteString:
        if ((next = part.match(RE_TRIPLE_QUOTE))) {
          token = TokenType.Punctuation
          state = State.TopLevelContent
        } else if ((next = part.match(RE_TRIPLE_QUOTE_CONTENT))) {
          token = TokenType.String
        } else {
          throw new Error('Failed to tokenize Roc multiline string')
        }
        break
      default:
        throw new Error('Invalid Roc tokenizer state')
    }
    index += next[0].length
    tokens.push(token, next[0].length)
  }
  return {
    state,
    tokens,
  }
}
