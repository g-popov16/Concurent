import { useState } from 'react'
import './Game1WaitAny.css'

const COLORS = ['#58d5ff', '#ff6b5f', '#ffd166', '#42e6a4']
const MISSIONS = [
  { mode: 'WaitAny', target: 2, text: 'Събуди thread-а от точно Handle[2]. Грешен първи сигнал проваля мисията.' },
  { mode: 'WaitAll', target: null, text: 'Подготви barrier: сигнализирай всички handles, без да връщаш вече готов handle.' },
  { mode: 'WaitAny', target: 0, text: 'Simulate аварийно събитие: само Handle[0] трябва да събуди WaitAny().' },
]

export default function Game1WaitAny() {
  const [lamps, setLamps] = useState([false, false, false, false])
  const [mode, setMode] = useState('WaitAny')
  const [status, setStatus] = useState('waiting')
  const [log, setLog] = useState([])
  const [missionIndex, setMissionIndex] = useState(0)
  const [mistakes, setMistakes] = useState(0)

  const mission = MISSIONS[missionIndex]

  const toggle = (i) => {
    if (status === 'completed') return
    if (mode === 'WaitAny' && mission.target !== null && i !== mission.target && !lamps[i]) {
      setMistakes(m => m + 1)
      setLog(l => [...l, `× Грешен първи сигнал: Handle[${i}] вместо Handle[${mission.target}]`])
      setStatus('failed')
      return
    }
    if (mode === 'WaitAll' && lamps[i]) {
      setMistakes(m => m + 1)
      setLog(l => [...l, `× Reset преди barrier-а — WaitAll пак блокира`])
    }

    const next = lamps.map((v, idx) => idx === i ? !v : v)
    const lit = next.filter(Boolean).length
    const newLog = [...log, next[i] ? `Handle[${i}].Set()` : `Handle[${i}].Reset()`]

    if (next[i]) {
      if (mode === 'WaitAny' && lit === 1) {
        setLamps(next)
        setLog([...newLog, `→ WaitAny() се събуди правилно от Handle[${i}]`])
        setStatus('completed')
        return
      }
      if (mode === 'WaitAll' && lit === 4) {
        setLamps(next)
        setLog([...newLog, '→ WaitAll() се събуди (всички 4 са сигнализирани)'])
        setStatus('completed')
        return
      }
    }
    setLamps(next)
    setLog(newLog)
  }

  const reset = () => {
    setLamps([false, false, false, false])
    setStatus('waiting')
    setLog([])
  }

  const nextMission = () => {
    const next = (missionIndex + 1) % MISSIONS.length
    setMissionIndex(next)
    setMode(MISSIONS[next].mode)
    setLamps([false, false, false, false])
    setStatus('waiting')
    setLog([])
  }

  return (
    <div className="g1-wrap">
      <div className="g1-main">
        <div className="tutorial-card">
          <span className="tutorial-step">1</span>
          <div>
            <div className="tutorial-title">Изпълни мисията, не просто светвай лампи.</div>
            <div className="tutorial-text">При WaitAny първият правилен Set() събужда thread-а. При WaitAll трябва всички handles да са Set едновременно.</div>
          </div>
        </div>

        <div className="g1-mode-row">
          <span className="g1-mode-label">Режим:</span>
          {['WaitAny', 'WaitAll'].map(m => (
            <button
              key={m}
              className={`g1-mode-btn ${mode === m ? 'active' : ''}`}
              onClick={() => { setMode(m); reset() }}
            >
              {m}
            </button>
          ))}
          <span className="g1-mode-desc">
            {mode === 'WaitAny'
              ? '— събужда при поне 1 сигнализиран'
              : '— събужда когато всичките 4 са сигнализирани'}
          </span>
        </div>

        <div className={`g1-mission ${status}`}>
          <span className="g1-mission-kicker">Мисия {missionIndex + 1}/{MISSIONS.length}</span>
          <span className="g1-mission-text">{mission.text}</span>
          <span className="g1-mission-score">Грешки: {mistakes}</span>
        </div>

        <div className="g1-handles">
          {lamps.map((lit, i) => (
            <button
              key={i}
              className={`g1-lamp ${lit ? 'lit' : ''} ${status === 'completed' ? 'done' : ''}`}
              style={{ '--lamp-color': COLORS[i] }}
              onClick={() => toggle(i)}
              disabled={status === 'completed' || status === 'failed'}
            >
              <div className="g1-lamp-bulb" />
              <div className="g1-lamp-label">Handle[{i}]</div>
              <div className="g1-lamp-state">{lit ? 'Set' : 'Reset'}</div>
            </button>
          ))}
        </div>

        <div className={`g1-thread ${status}`}>
          <div className="thread" style={{ background: '#7c6af520', color: '#9d8ff8', borderColor: '#7c6af580' }}>T</div>
          <div className="g1-thread-info">
            <span className="g1-thread-call">
              {mode === 'WaitAny' ? 'WaitHandle.WaitAny(handles)' : 'WaitHandle.WaitAll(handles)'}
            </span>
            <span className={`g1-thread-status ${status}`}>
              {status === 'waiting' ? '… блокиран …' : '✓ Продължава изпълнението'}
            </span>
          </div>
        </div>

        <button className="g1-reset-btn" onClick={reset}>
          Рестартирай
        </button>
        <button className="g1-reset-btn" onClick={nextMission}>
          Следваща мисия
        </button>
      </div>

      <div className="g1-log">
        <div className="g1-log-header">Лог</div>
        {log.length === 0
          ? <div className="g1-log-empty">Кликни лампа, за да извикаш Set()</div>
          : log.map((l, i) => (
            <div key={i} className={`g1-log-entry ${l.startsWith('→') ? 'wake' : ''}`}>{l}</div>
          ))
        }
      </div>
    </div>
  )
}
