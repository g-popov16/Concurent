import { useState, useCallback, useRef } from 'react'
import './Game4TrafficLight.css'

const THREAD_COLORS = [
  '#7c6af5', '#e8622a', '#c9922a', '#3ec88a', '#5ba4f5', '#f56565',
]
const QUEUE_SIZE = 6
const SEQUENCES = [
  { label: 'Broadcast старт', actions: ['manualSet', 'autoSet'] },
  { label: 'Auto три задачи', actions: ['autoSet', 'autoSet', 'autoSet'] },
  { label: 'Manual reset trap', actions: ['manualSet', 'manualReset', 'manualSet'] },
]

export default function Game4TrafficLight() {
  const [manualState, setManualState] = useState({ gateOpen: false, passed: 0, setCount: 0, resetCount: 0, log: [] })
  const [autoState, setAutoState]     = useState({ gateOpen: false, passed: 0, setCount: 0, log: [] })

  const manualRef = useRef(manualState)
  manualRef.current = manualState

  const manualSet = useCallback(() => {
    const s = manualRef.current
    if (s.gateOpen) return
    const remaining = QUEUE_SIZE - s.passed

    setManualState(prev => ({
      ...prev,
      gateOpen: true,
      setCount: prev.setCount + 1,
      log: [...prev.log.slice(-10), `Set() — портата отваря (Manual)`],
    }))

    for (let i = 0; i < remaining; i++) {
      setTimeout(() => {
        setManualState(prev => {
          if (!prev.gateOpen || prev.passed >= QUEUE_SIZE) return prev
          return { ...prev, passed: prev.passed + 1 }
        })
      }, 200 + i * 180)
    }
  }, [])

  const manualReset = useCallback(() => {
    setManualState(s => ({
      ...s,
      gateOpen: false,
      resetCount: s.resetCount + 1,
      log: [...s.log.slice(-10), `Reset() — портата се затваря`],
    }))
  }, [])

  const autoRef = useRef(autoState)
  autoRef.current = autoState

  const autoSet = useCallback(() => {
    const s = autoRef.current
    if (s.passed >= QUEUE_SIZE || s.gateOpen) return

    setAutoState(prev => ({
      ...prev,
      gateOpen: true,
      setCount: prev.setCount + 1,
    }))

    setTimeout(() => {
      setAutoState(prev => {
        if (!prev.gateOpen) return prev
        const newPassed = prev.passed + 1
        return {
          ...prev,
          gateOpen: false,
          passed: newPassed,
          log: [...prev.log.slice(-10), `Set() → T${newPassed} преминава (auto reset)`],
        }
      })
    }, 400)
  }, [])

  const resetAll = () => {
    setManualState({ gateOpen: false, passed: 0, setCount: 0, resetCount: 0, log: [] })
    setAutoState({ gateOpen: false, passed: 0, setCount: 0, log: [] })
  }

  const runSequence = (actions) => {
    actions.forEach((action, i) => {
      setTimeout(() => {
        if (action === 'manualSet') manualSet()
        if (action === 'manualReset') manualReset()
        if (action === 'autoSet') autoSet()
      }, i * 720)
    })
  }

  const threads = Array.from({ length: QUEUE_SIZE }, (_, i) => i)

  const renderLane = (label, state, isManual) => (
    <div className="g4-lane">
      <div className="g4-lane-label" style={{ color: isManual ? 'var(--manual)' : 'var(--auto)' }}>
        {label}
      </div>

      <div className="g4-lane-body">
        <div className="g4-queue-threads">
          {threads.map(i => (
            <div key={i} className={`g4-thread-slot ${i < state.passed ? 'passed' : 'waiting'}`}>
              <div className="thread" style={{
                width: 36, height: 36, fontSize: 11,
                background: `${THREAD_COLORS[i]}20`,
                color: THREAD_COLORS[i],
                borderColor: `${THREAD_COLORS[i]}80`,
              }}>T{i + 1}</div>
            </div>
          ))}
        </div>

        <div className={`g4-gate ${state.gateOpen ? 'open' : 'closed'} ${isManual ? 'manual' : 'auto'}`}>
          <div className="g4-light red"   style={{ opacity: state.gateOpen ? 0.2 : 1 }} />
          <div className="g4-light green" style={{ opacity: state.gateOpen ? 1 : 0.2 }} />
          <div className="g4-gate-text">{state.gateOpen ? 'OPEN' : 'CLOSED'}</div>
        </div>

        <div className="g4-passed-col">
          <div className="g4-passed-val">{state.passed}</div>
          <div className="g4-passed-label">Преминали</div>
        </div>
      </div>

      {isManual && (
        <div className="g4-lane-controls">
          <button className="g4-btn set" onClick={manualSet} disabled={state.gateOpen}>Set()</button>
          <button className="g4-btn reset" onClick={manualReset} disabled={!state.gateOpen}>Reset()</button>
          <span className="g4-counter-info">Set: {state.setCount} · Reset: {state.resetCount}</span>
        </div>
      )}

      {!isManual && (
        <div className="g4-lane-controls">
          <button className="g4-btn set auto" onClick={autoSet} disabled={state.passed >= QUEUE_SIZE || state.gateOpen}>Set()</button>
          <button className="g4-btn reset" disabled style={{ opacity: 0.2 }}>Reset() — N/A</button>
          <span className="g4-counter-info">Set: {state.setCount}</span>
        </div>
      )}

      <div className="g4-log">
        {state.log.slice(-4).map((l, i) => (
          <div key={i} className="g4-log-entry">{l}</div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="g4-wrap">
      <div className="tutorial-card">
        <span className="tutorial-step">A/B</span>
        <div>
          <div className="tutorial-title">Сравнявай двата реда със същите действия.</div>
          <div className="tutorial-text">ManualResetEvent остава отворен до Reset(). AutoResetEvent се затваря сам след един преминал thread.</div>
        </div>
      </div>

      <div className="g4-hint">
        Приложи <strong>еднакви действия</strong> на двата реда и виж разликата в поведението
      </div>
      <div className="g4-sequences">
        {SEQUENCES.map(seq => (
          <button key={seq.label} className="g4-seq-btn" onClick={() => runSequence(seq.actions)}>
            {seq.label}
          </button>
        ))}
      </div>
      <div className="g4-lanes">
        {renderLane('ManualResetEvent', manualState, true)}
        <div className="g4-divider" />
        {renderLane('AutoResetEvent', autoState, false)}
      </div>
      <button className="g4-reset-btn" onClick={resetAll}>Рестартирай всичко</button>
    </div>
  )
}
