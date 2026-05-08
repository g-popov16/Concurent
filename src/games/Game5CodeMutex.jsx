import { useState, useEffect, useRef } from 'react'
import './CodeGame.css'

const BLANKS = {
  b1: { answer: 'WaitOne(TimeSpan.FromSeconds(5))', hint: 'Използвай timeout, не безкрайно WaitOne()' },
  b2: { answer: 'TimeoutException', hint: 'При timeout прекъсни вместо да продължиш без mutex' },
  b3: { answer: 'ReleaseMutex()', hint: 'Задължително във finally — само owner освобождава' },
}

const LINES = [
  { t: 's', code: 'static readonly Mutex _mutex = new(false, "Global\\\\SharedCounter");' },
  { t: 'e' },
  { t: 's', code: 'void DoWork()' },
  { t: 's', code: '{' },
  { t: 'b', pre: '    if (!_mutex.', id: 'b1', post: ')', comment: '// придобий с timeout' },
  { t: 'b', pre: '        throw new ', id: 'b2', post: '("Mutex timeout");', comment: '// не влизай без lock' },
  { t: 'e' },
  { t: 's', code: '    try' },
  { t: 's', code: '    {' },
  { t: 's', code: '        sharedCounter += 1;' },
  { t: 's', code: '        SaveToDisk(sharedCounter);' },
  { t: 's', code: '    }' },
  { t: 's', code: '    finally' },
  { t: 's', code: '    {' },
  { t: 'b', pre: '        _mutex.', id: 'b3', post: ';', comment: '// owner thread освобождава' },
  { t: 's', code: '    }' },
  { t: 's', code: '}' },
]

const initValues = () => Object.fromEntries(Object.keys(BLANKS).map(k => [k, '']))

function isCorrect(id, val) {
  const normalize = (v) => v.trim().replace(/\s+/g, '').toLowerCase()
  return normalize(val) === normalize(BLANKS[id].answer)
}

function isCheatShortcut(e) {
  return e.ctrlKey && e.shiftKey && (e.key === '.' || e.key === '>' || e.code === 'Period')
}

export default function Game5CodeMutex() {
  const [values, setValues] = useState(initValues)
  const [revealed, setRevealed] = useState(false)
  const [cheatMode, setCheatMode] = useState(false)
  const firstRef = useRef(null)

  const allDone = Object.keys(BLANKS).every(id => isCorrect(id, values[id]))

  useEffect(() => {
    firstRef.current?.focus()
  }, [])

  // Secret combo: Ctrl+Shift+. — not shown anywhere in the UI
  useEffect(() => {
    const handler = (e) => {
      if (isCheatShortcut(e)) {
        e.preventDefault()
        setCheatMode(v => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleChange = (id, val) => {
    if (cheatMode) {
      const ans = BLANKS[id].answer
      setValues(prev => ({ ...prev, [id]: ans.slice(0, val.length) }))
    } else {
      setValues(prev => ({ ...prev, [id]: val }))
      setRevealed(false)
    }
  }

  const handleKeyDown = (id, e) => {
    if (e.key === 'Enter') {
      setRevealed(true)
      return
    }

    if (!cheatMode) return

    const ans = BLANKS[id].answer
    if (e.key === 'Backspace') {
      e.preventDefault()
      setValues(prev => ({ ...prev, [id]: prev[id].slice(0, -1) }))
      setRevealed(false)
      return
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault()
      setValues(prev => ({ ...prev, [id]: ans.slice(0, Math.min(prev[id].length + 1, ans.length)) }))
      setRevealed(false)
    }
  }

  const blankState = (id) => {
    if (isCorrect(id, values[id])) return 'correct'
    if (revealed && values[id]) return 'wrong'
    return ''
  }

  const reset = () => {
    setValues(initValues)
    setRevealed(false)
    setCheatMode(false)
    setTimeout(() => firstRef.current?.focus(), 0)
  }

  let blankCount = 0

  return (
    <div className="codegame">
      <div className="tutorial-card">
        <span className="tutorial-step">C#</span>
        <div>
          <div className="tutorial-title">Попълни pattern-а, не само метода.</div>
          <div className="tutorial-text">Търси три части: timeout при WaitOne, exception при отказ и ReleaseMutex() във finally.</div>
        </div>
      </div>

      <p className="cg-desc">
        Два процеса достъпват общ брояч. Попълни timeout придобиването, грешката при отказ и безопасното освобождаване.
      </p>

      <div className="cg-editor">
        <div className="cg-editor-bar">
          <span className="cg-lang">C#</span>
          {cheatMode && <span className="cg-cheat-dot" title="cheat" />}
          {allDone && <span className="cg-done-badge">Правилно!</span>}
        </div>
        <div className="cg-code">
          {LINES.map((line, i) => {
            if (line.t === 'b') blankCount++
            const isFirst = line.t === 'b' && blankCount === 1
            return (
              <div key={i} className="cg-row">
                <span className="cg-ln">{i + 1}</span>
                {line.t === 'e' ? (
                  <span className="cg-text">&nbsp;</span>
                ) : line.t === 's' ? (
                  <span className="cg-text">{line.code}</span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <span className="cg-text">{line.pre}</span>
                    <span className={`cg-blank ${blankState(line.id)}`}>
                      <input
                        ref={isFirst ? firstRef : null}
                        className="cg-input"
                        value={values[line.id]}
                        onChange={e => handleChange(line.id, e.target.value)}
                        onKeyDown={e => handleKeyDown(line.id, e)}
                        style={{ width: `${Math.max(values[line.id].length + 1, BLANKS[line.id].answer.length + 2)}ch` }}
                        spellCheck={false}
                        autoComplete="off"
                        placeholder="___"
                      />
                    </span>
                    <span className="cg-text">{line.post}</span>
                    <span className="cg-comment">{line.comment}</span>
                    {revealed && blankState(line.id) === 'wrong' && (
                      <span className="cg-hint"> ← {BLANKS[line.id].hint}</span>
                    )}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="cg-actions">
        <button className="cg-btn-check" onClick={() => setRevealed(true)} disabled={allDone}>
          Провери
        </button>
        <button className="cg-btn-reset" onClick={reset}>
          Изчисти
        </button>
      </div>
    </div>
  )
}
