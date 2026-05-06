import { useState, useEffect, useRef } from 'react'
import './CodeGame.css'

const BLANKS = {
  b1: { answer: 'false', hint: 'true = вече сигнализиран; false = заключен (чака Set)' },
  b2: { answer: 'lock (_sync)', hint: 'Опашката се пази с lock; event-ът само сигнализира' },
  b3: { answer: 'Set()', hint: 'Сигнализира събитието — събужда точно един чакащ thread' },
  b4: { answer: 'WaitOne()', hint: 'Блокира, докато не пристигне Set()' },
  b5: { answer: 'lock (_sync)', hint: 'Dequeue също трябва да е в същия lock' },
}

const LINES = [
  { t: 's', code: 'static readonly object _sync = new();' },
  { t: 's', code: 'static readonly Queue<Job> _queue = new();' },
  { t: 's', code: 'static readonly AutoResetEvent _event =' },
  { t: 'b', pre: '    new AutoResetEvent(', id: 'b1', post: ');', comment: '' },
  { t: 'e' },
  { t: 's', code: 'void Producer(Job job)' },
  { t: 's', code: '{' },
  { t: 'b', pre: '    ', id: 'b2', post: '', comment: '// защити queue' },
  { t: 's', code: '        _queue.Enqueue(job);' },
  { t: 'b', pre: '    _event.', id: 'b3', post: ';', comment: '// събуди един consumer' },
  { t: 's', code: '}' },
  { t: 'e' },
  { t: 's', code: 'void Consumer()' },
  { t: 's', code: '{' },
  { t: 'b', pre: '    _event.', id: 'b4', post: ';', comment: '// изчакай сигнал' },
  { t: 's', code: '    Job job;' },
  { t: 'b', pre: '    ', id: 'b5', post: '', comment: '// защити Dequeue' },
  { t: 's', code: '        job = _queue.Dequeue();' },
  { t: 's', code: '    Process(job);' },
  { t: 's', code: '}' },
]

const initValues = () => Object.fromEntries(Object.keys(BLANKS).map(k => [k, '']))

function isCorrect(id, val) {
  const normalize = (v) => v.trim().replace(/\s+/g, '').toLowerCase()
  return normalize(val) === normalize(BLANKS[id].answer)
}

export default function Game6CodeAutoReset() {
  const [values, setValues] = useState(initValues)
  const [revealed, setRevealed] = useState(false)
  const [cheated, setCheated] = useState(false)
  const firstRef = useRef(null)

  const allDone = Object.keys(BLANKS).every(id => isCorrect(id, values[id]))

  useEffect(() => {
    firstRef.current?.focus()
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (e.key !== '`') return
      e.preventDefault()
      setValues(Object.fromEntries(Object.keys(BLANKS).map(k => [k, BLANKS[k].answer])))
      setRevealed(true)
      setCheated(true)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleChange = (id, val) => {
    setValues(prev => ({ ...prev, [id]: val }))
    setRevealed(false)
    setCheated(false)
  }

  const blankState = (id) => {
    if (isCorrect(id, values[id])) return 'correct'
    if (revealed && values[id]) return 'wrong'
    return ''
  }

  const reset = () => {
    setValues(initValues)
    setRevealed(false)
    setCheated(false)
    setTimeout(() => firstRef.current?.focus(), 0)
  }

  let blankCount = 0

  return (
    <div className="codegame">
      <div className="tutorial-card">
        <span className="tutorial-step">Q</span>
        <div>
          <div className="tutorial-title">Раздели двата проблема.</div>
          <div className="tutorial-text">lock пази queue-то. AutoResetEvent не пази данни; той само събужда един consumer, когато има задача.</div>
        </div>
      </div>

      <p className="cg-desc">
        Producer-consumer без загубен сигнал: попълни началното състояние, синхронизацията на опашката и AutoResetEvent повикванията.
      </p>

      <div className="cg-editor">
        <div className="cg-editor-bar">
          <span className="cg-lang">C#</span>
          {allDone && (
            <span className="cg-done-badge">
              {cheated ? '` използван — запомни отговорите' : 'Правилно!'}
            </span>
          )}
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
                        onKeyDown={e => e.key === 'Enter' && setRevealed(true)}
                        style={{ width: `${Math.max(values[line.id].length + 1, BLANKS[line.id].answer.length + 2)}ch` }}
                        spellCheck={false}
                        autoComplete="off"
                        placeholder="___"
                      />
                    </span>
                    <span className="cg-text">{line.post}</span>
                    {line.comment && <span className="cg-comment">{line.comment}</span>}
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
        <span className="cg-cheat">` — автопопълване</span>
      </div>
    </div>
  )
}
