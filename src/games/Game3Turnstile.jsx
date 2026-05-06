import { useState, useCallback, useRef } from 'react'
import './Game3Turnstile.css'

const THREAD_COLORS = [
  '#58d5ff', '#ff6b5f', '#ffd166', '#42e6a4', '#7dd3fc',
  '#f472b6', '#a3e635', '#c084fc',
]

const QUEUE_SIZE = 8

export default function Game3Turnstile() {
  const [setCount, setSetCount] = useState(0)
  const [passed, setPassed] = useState(0)
  const [gateOpen, setGateOpen] = useState(false)
  const [log, setLog] = useState([])
  const [burstCount, setBurstCount] = useState(0)
  const stateRef = useRef({ passed, gateOpen, setCount })
  stateRef.current = { passed, gateOpen, setCount }

  const totalQueued = QUEUE_SIZE - passed

  const fireSignal = useCallback((source = 'Set()') => {
    const current = stateRef.current
    if (current.passed >= QUEUE_SIZE || current.gateOpen) return

    setSetCount(c => c + 1)
    setGateOpen(true)

    setTimeout(() => {
      setPassed(p => {
        const nextPassed = Math.min(p + 1, QUEUE_SIZE)
        setLog(l => [...l.slice(-10), `${source} #${stateRef.current.setCount + 1} → T${nextPassed} преминава`])
        return nextPassed
      })
      setGateOpen(false)
    }, 400)
  }, [])

  const handleSet = useCallback(() => fireSignal('Set()'), [fireSignal])

  const handleBurst = useCallback(() => {
    if (stateRef.current.passed >= QUEUE_SIZE) return
    setBurstCount(c => c + 1)
    ;[0, 620, 1240].forEach((delay, i) => {
      setTimeout(() => fireSignal(`Burst ${burstCount + 1}.${i + 1}`), delay)
    })
  }, [burstCount, fireSignal])

  const reset = () => {
    setSetCount(0)
    setPassed(0)
    setGateOpen(false)
    setLog([])
    setBurstCount(0)
  }

  const threads = Array.from({ length: QUEUE_SIZE }, (_, i) => i)

  return (
    <div className="g3-wrap">
      <div className="g3-main">
        <div className="tutorial-card">
          <span className="tutorial-step">3</span>
          <div>
            <div className="tutorial-title">Всеки Set() е един билет през турникета.</div>
            <div className="tutorial-text">Натисни Set() бавно, после Burst x3. Забележи, че AutoResetEvent пак пуска по един thread за сигнал.</div>
          </div>
        </div>

        <div className="g3-scene">
          <div className="g3-queue-side">
            <div className="g3-side-label">Опашка ({totalQueued} чакат)</div>
            <div className="g3-threads">
              {threads.map(i => {
                const state = i < passed ? 'passed' : i === passed ? 'next' : 'waiting'
                return (
                  <div
                    key={i}
                    className={`g3-thread-slot ${state}`}
                    style={{ '--tc': THREAD_COLORS[i % THREAD_COLORS.length] }}
                  >
                    <div className="thread g3-dot" style={{ background: `${THREAD_COLORS[i % THREAD_COLORS.length]}20`, color: THREAD_COLORS[i % THREAD_COLORS.length], borderColor: `${THREAD_COLORS[i % THREAD_COLORS.length]}80` }}>
                      T{i + 1}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="g3-gate-area">
            <div className={`g3-gate ${gateOpen ? 'open' : 'closed'}`}>
              <div className="g3-gate-bar top" />
              <div className="g3-gate-label">{gateOpen ? 'OPEN' : 'LOCKED'}</div>
              <div className="g3-gate-bar bottom" />
            </div>
            <div className="g3-gate-type">AutoResetEvent</div>
          </div>

          <div className="g3-passed-side">
            <div className="g3-side-label">Преминали ({passed})</div>
            <div className="g3-threads">
              {threads.slice(0, passed).map(i => (
                <div key={i} className="g3-thread-slot passed" style={{ '--tc': THREAD_COLORS[i % THREAD_COLORS.length] }}>
                  <div className="thread g3-dot" style={{ background: `${THREAD_COLORS[i % THREAD_COLORS.length]}20`, color: THREAD_COLORS[i % THREAD_COLORS.length], borderColor: `${THREAD_COLORS[i % THREAD_COLORS.length]}80`, opacity: 0.6 }}>
                    T{i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="g3-counters">
          <div className="g3-counter">
            <span className="g3-counter-val auto-color">{setCount}</span>
            <span className="g3-counter-label">Set() извикан</span>
          </div>
          <span className="g3-counter-eq">=</span>
          <div className="g3-counter">
            <span className="g3-counter-val manual-color">{passed}</span>
            <span className="g3-counter-label">Преминали</span>
          </div>
          <div className="g3-counter g3-burst-counter">
            <span className="g3-counter-val">{burstCount}</span>
            <span className="g3-counter-label">Burst серии</span>
          </div>
        </div>

        <div className="g3-controls">
          <button
            className="g3-set-btn"
            onClick={handleSet}
            disabled={passed >= QUEUE_SIZE || gateOpen}
          >
            Set()
          </button>
          <button
            className="g3-burst-btn"
            onClick={handleBurst}
            disabled={passed >= QUEUE_SIZE || gateOpen}
          >
            Burst x3
          </button>
          <button className="g3-reset-btn" onClick={reset}>Рестартирай</button>
        </div>

        {passed === QUEUE_SIZE && (
          <div className="g3-done">Всички {QUEUE_SIZE} thread-а преминаха. Set() = Преминали = {QUEUE_SIZE}</div>
        )}
      </div>

      <div className="g3-log">
        <div className="g3-log-header">Лог</div>
        {log.length === 0
          ? <div className="g3-log-empty">Натисни Set() за да пуснеш thread</div>
          : [...log].reverse().map((l, i) => (
            <div key={i} className="g3-log-entry">{l}</div>
          ))
        }
      </div>
    </div>
  )
}
