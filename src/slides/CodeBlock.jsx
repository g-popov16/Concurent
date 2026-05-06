const KEYWORDS = ['var','new','true','false','null','using','class','public','private','static','void','bool','int','string','return','if','else','for','foreach','in','out','throw','try','catch','finally','await','async','abstract','virtual','override','readonly','const','this','base']

const TYPES = ['Mutex','AutoResetEvent','ManualResetEvent','EventWaitHandle','WaitHandle','EventResetMode','Task','Console','Application','MessageBox','Queue','Enumerable','TimeSpan','AbandonedMutexException','ApplicationException','ObjectDisposedException','TimeoutException','SafeWaitHandle']

function tokenize(code) {
  const tokens = []
  let i = 0
  while (i < code.length) {
    if (code[i] === '/' && code[i+1] === '/') {
      const end = code.indexOf('\n', i)
      const text = end === -1 ? code.slice(i) : code.slice(i, end)
      tokens.push({ type: 'comment', text })
      i += text.length
      continue
    }
    if (code[i] === '"') {
      let j = i + 1
      while (j < code.length && code[j] !== '"') {
        if (code[j] === '\\') j++
        j++
      }
      tokens.push({ type: 'string', text: code.slice(i, j + 1) })
      i = j + 1
      continue
    }
    if (code[i] === '$' && code[i+1] === '"') {
      let j = i + 2
      while (j < code.length && code[j] !== '"') {
        if (code[j] === '\\') j++
        j++
      }
      tokens.push({ type: 'string', text: code.slice(i, j + 1) })
      i = j + 1
      continue
    }
    if (/\d/.test(code[i])) {
      let j = i
      while (j < code.length && /[\d.]/.test(code[j])) j++
      tokens.push({ type: 'number', text: code.slice(i, j) })
      i = j
      continue
    }
    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i
      while (j < code.length && /\w/.test(code[j])) j++
      const word = code.slice(i, j)
      if (KEYWORDS.includes(word))       tokens.push({ type: 'keyword', text: word })
      else if (TYPES.includes(word))     tokens.push({ type: 'type', text: word })
      else if (code[j] === '(')         tokens.push({ type: 'method', text: word })
      else                               tokens.push({ type: 'var', text: word })
      i = j
      continue
    }
    tokens.push({ type: 'plain', text: code[i] })
    i++
  }
  return tokens
}

export default function CodeBlock({ code, compact }) {
  const tokens = tokenize(code)
  return (
    <pre className={compact ? 'code-compact' : ''} style={compact ? { padding: '8px 12px', fontSize: 12, marginTop: 8 } : {}}>
      <code>
        {tokens.map((tok, i) => (
          <span key={i} className={`token-${tok.type}`}>{tok.text}</span>
        ))}
      </code>
    </pre>
  )
}
