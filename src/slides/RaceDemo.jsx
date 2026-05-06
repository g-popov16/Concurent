import { useState, useRef } from 'react'
import './RaceDemo.css'

const ITERATIONS = 1000

async function runUnsafe(setLog, setResult) {
  setLog([])
  setResult(null)
  let counter = 0
  const log = []

  const t1 = async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const read = counter
      await new Promise(r => setTimeout(r, 0))
      counter = read + 1
    }
  }

  const t2 = async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const read = counter
      await new Promise(r => setTimeout(r, 0))
      counter = read + 1
    }
  }

  await Promise.all([t1(), t2()])
  return counter
}

function runSafe() {
  let counter = 0
  for (let i = 0; i < ITERATIONS * 2; i++) counter++
  return counter
}

export default function RaceDemo() {
  const [mode, setMode] = useState(null)
  const [result, setResult] = useState(null)
  const [running, setRunning] = useState(false)
  const [log, setLog] = useState([])

  const startUnsafe = async () => {
    setMode('unsafe')
    setRunning(true)
    setResult(null)
    setLog(['T1 старт', 'T2 старт'])
    const r = await runUnsafe(setLog, setResult)
    setResult(r)
    setRunning(false)
  }

  const startSafe = () => {
    setMode('safe')
    setRunning(true)
    setResult(null)
    setTimeout(() => {
      const r = runSafe()
      setResult(r)
      setRunning(false)
    }, 400)
  }

  const expected = ITERATIONS * 2

  return (
    <div className="race-demo">
      <div className="tutorial-card">
        <span className="tutorial-step">1</span>
        <div>
          <div className="tutorial-title">Първо стартирай без синхронизация, после с lock.</div>
          <div className="tutorial-text">Сравни резултата с очакваните 2000. Ако числото е по-малко, два thread-а са презаписали една и съща стойност.</div>
        </div>
      </div>

      <div className="race-explain">
        <p>Всеки от двата thread-а инкрементира брояч <code>{ITERATIONS}</code> пъти.</p>
        <p>Без синхронизация, операцията <code>counter++</code> не е атомарна — тя се разгъва на <em>read → modify → write</em>.</p>
      </div>

      <div className="race-controls">
        <button
          className="race-btn unsafe"
          onClick={startUnsafe}
          disabled={running}
        >
          {running && mode === 'unsafe' ? 'Работи…' : 'Старт без синхронизация'}
        </button>
        <button
          className="race-btn safe"
          onClick={startSafe}
          disabled={running}
        >
          {running && mode === 'safe' ? 'Работи…' : 'Старт с lock'}
        </button>
      </div>

      {result !== null && (
        <div className={`race-result ${result < expected ? 'wrong' : 'ok'}`}>
          <div className="race-result-row">
            <span className="race-result-label">Резултат</span>
            <span className="race-result-value">{result.toLocaleString()}</span>
          </div>
          <div className="race-result-row">
            <span className="race-result-label">Очаквано</span>
            <span className="race-result-expected">{expected.toLocaleString()}</span>
          </div>
          {result < expected && (
            <div className="race-result-loss">
              Загубени инкременти: <strong>{(expected - result).toLocaleString()}</strong>
            </div>
          )}
          {result === expected && (
            <div className="race-result-ok">Всички инкременти отчетени</div>
          )}
        </div>
      )}

      <div className="race-threads">
        <div className={`race-thread t1 ${running ? 'active' : ''}`}>
          <div className="thread t1-color">T1</div>
          <span>
            {mode === 'safe' ? 'lock { counter++ }' : 'counter++'}
          </span>
        </div>
        <div className="race-shared">
          <div className="shared-box">
            <span className="shared-label">counter</span>
            <span className="shared-value">{result ?? '0'}</span>
          </div>
        </div>
        <div className={`race-thread t2 ${running ? 'active' : ''}`}>
          <div className="thread t2-color">T2</div>
          <span>
            {mode === 'safe' ? 'lock { counter++ }' : 'counter++'}
          </span>
        </div>
      </div>
    </div>
  )
}
