import { useState, useRef, useCallback } from 'react'
import { Warning, Lock, Lightning, ArrowCounterClockwise, Check } from '@phosphor-icons/react'
import './RaceDemo.css'

const ROUNDS = 50
const delay = (ms) => new Promise((r) => setTimeout(r, ms))
const SPEED_MS = { slow: 750, normal: 280, fast: 65 }

function ThreadLane({ color, label, phase, register }) {
  const steps = [
    { key: 'read', text: 'READ' },
    { key: 'compute', text: '+1' },
    { key: 'write', text: 'WRITE' },
  ]
  return (
    <div className="tl" style={{ '--tc': color, borderColor: phase !== 'idle' ? `color-mix(in srgb, ${color} 45%, transparent)` : undefined }}>
      <div className="tl-label" style={{ color }}>{label}</div>
      <div className="tl-steps">
        {steps.map((s) => (
          <div key={s.key} className={`tl-step ${phase === s.key ? 'tl-on' : ''}`}>
            <div className="tl-dot" />
            <div className="tl-step-name">{s.text}</div>
          </div>
        ))}
      </div>
      <div className="tl-reg">
        <span className="tl-reg-label">reg</span>
        <span className="tl-reg-val">{register !== null ? register : '—'}</span>
      </div>
    </div>
  )
}

function MiniGraph({ points, mode }) {
  const W = 300
  const H = 88
  if (points.length < 2) return null
  const maxX = points[points.length - 1].round
  const maxY = points[points.length - 1].expected || 1
  const x = (r) => ((r / maxX) * (W - 8) + 4).toFixed(1)
  const y = (v) => (H - (v / maxY) * (H - 4) - 2).toFixed(1)
  const exp = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.round)},${y(p.expected)}`).join(' ')
  const act = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.round)},${y(p.actual)}`).join(' ')
  const last = points[points.length - 1]
  const lineColor = mode === 'safe' ? 'var(--manual)' : 'var(--mutex)'
  return (
    <svg className="mini-graph" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <path d={exp} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1.5" strokeDasharray="5,3" />
      <path d={act} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(last.round)} cy={y(last.actual)} r="3.5" fill={lineColor} />
    </svg>
  )
}

const INIT = {
  running: false,
  mode: null,
  done: false,
  counter: 0,
  expected: 0,
  round: 0,
  conflicts: 0,
  t1: { phase: 'idle', register: null },
  t2: { phase: 'idle', register: null },
  flash: false,
  graphPoints: [],
}

export default function RaceDemo() {
  const [sim, setSim] = useState(INIT)
  const [speed, setSpeed] = useState('normal')
  const abortRef = useRef(false)

  const reset = useCallback(() => {
    abortRef.current = true
    setSim(INIT)
  }, [])

  const runUnsafe = useCallback(async (sp) => {
    abortRef.current = false
    let counter = 0
    let expected = 0
    let conflicts = 0
    const pts = []

    setSim({ ...INIT, running: true, mode: 'unsafe' })

    for (let round = 1; round <= ROUNDS; round++) {
      if (abortRef.current) return

      // Both threads READ the same counter value simultaneously
      setSim((s) => ({ ...s, t1: { phase: 'read', register: counter }, t2: { phase: 'read', register: counter } }))
      await delay(sp)
      if (abortRef.current) return

      const r1 = counter, r2 = counter

      // Both COMPUTE
      setSim((s) => ({ ...s, t1: { phase: 'compute', register: r1 + 1 }, t2: { phase: 'compute', register: r2 + 1 } }))
      await delay(sp)
      if (abortRef.current) return

      // T1 WRITES first
      counter = r1 + 1
      setSim((s) => ({ ...s, counter, t1: { phase: 'write', register: r1 + 1 }, t2: { phase: 'compute', register: r2 + 1 } }))
      await delay(sp * 0.55)
      if (abortRef.current) return

      // T2 OVERWRITES — race condition!
      counter = r2 + 1 // same as r1+1, so we gained only 1 instead of 2
      expected += 2
      conflicts++
      pts.push({ round, actual: counter, expected })

      setSim((s) => ({
        ...s,
        counter,
        expected,
        round,
        conflicts,
        flash: true,
        t1: { phase: 'idle', register: null },
        t2: { phase: 'write', register: r2 + 1 },
        graphPoints: [...pts],
      }))
      await delay(sp * 0.6)
      if (abortRef.current) return

      setSim((s) => ({ ...s, flash: false, t2: { phase: 'idle', register: null } }))
      await delay(sp * 0.25)
      if (abortRef.current) return
    }

    setSim((s) => ({ ...s, running: false, done: true }))
  }, [])

  const runSafe = useCallback(async (sp) => {
    abortRef.current = false
    let counter = 0
    let expected = 0
    const pts = []

    setSim({ ...INIT, running: true, mode: 'safe' })

    for (let round = 1; round <= ROUNDS; round++) {
      if (abortRef.current) return

      // T1 holds lock — full atomic cycle
      setSim((s) => ({ ...s, t1: { phase: 'read', register: counter }, t2: { phase: 'idle', register: null } }))
      await delay(sp * 0.55)
      if (abortRef.current) return

      setSim((s) => ({ ...s, t1: { phase: 'compute', register: counter + 1 } }))
      await delay(sp * 0.55)
      if (abortRef.current) return

      counter++; expected++
      setSim((s) => ({ ...s, counter, t1: { phase: 'write', register: counter } }))
      await delay(sp * 0.45)
      if (abortRef.current) return

      // T2 acquires lock
      setSim((s) => ({ ...s, t1: { phase: 'idle', register: null }, t2: { phase: 'read', register: counter } }))
      await delay(sp * 0.55)
      if (abortRef.current) return

      setSim((s) => ({ ...s, t2: { phase: 'compute', register: counter + 1 } }))
      await delay(sp * 0.55)
      if (abortRef.current) return

      counter++; expected++
      pts.push({ round, actual: counter, expected })
      setSim((s) => ({ ...s, counter, expected, round, t2: { phase: 'write', register: counter }, graphPoints: [...pts] }))
      await delay(sp * 0.45)
      if (abortRef.current) return

      setSim((s) => ({ ...s, t2: { phase: 'idle', register: null } }))
    }

    setSim((s) => ({ ...s, running: false, done: true }))
  }, [])

  const lost = sim.expected - sim.counter
  const accuracy = sim.expected > 0 ? Math.round((sim.counter / sim.expected) * 100) : 100

  return (
    <div className="race-demo">

      {/* Controls */}
      <div className="race-top-bar">
        <div className="race-actions">
          <button className="race-btn r-unsafe" onClick={() => runUnsafe(SPEED_MS[speed])} disabled={sim.running}>
            {sim.running && sim.mode === 'unsafe'
              ? <><Lightning size={14} weight="fill" /> Работи…</>
              : <><Warning size={14} weight="duotone" /> Без синхронизация</>}
          </button>
          <button className="race-btn r-safe" onClick={() => runSafe(SPEED_MS[speed])} disabled={sim.running}>
            {sim.running && sim.mode === 'safe'
              ? <><Lock size={14} weight="duotone" /> Работи…</>
              : <><Lock size={14} weight="duotone" /> С lock</>}
          </button>
          <button className="race-btn r-reset" onClick={reset}><ArrowCounterClockwise size={14} weight="bold" /></button>
        </div>
        <div className="speed-control">
          {[['slow', 'Бавно'], ['normal', 'Нормално'], ['fast', 'Бързо']].map(([s, label]) => (
            <button key={s} className={`speed-btn ${speed === s ? 'spd-on' : ''}`} onClick={() => setSpeed(s)} disabled={sim.running}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Visual arena */}
      <div className="race-arena">
        <ThreadLane color="var(--accent)" label="T1" phase={sim.t1.phase} register={sim.t1.register} />

        <div className="race-center">
          <div className={`memory-box ${sim.flash ? 'mem-flash' : ''} ${sim.mode === 'safe' && sim.done ? 'mem-ok' : ''}`}>
            <div className="memory-label">counter</div>
            <div className="memory-val">{sim.counter}</div>
            {sim.flash && <div className="conflict-badge">RACE!</div>}
          </div>
          <div className="center-arrows">
            <div className={`c-arrow c-left ${sim.t1.phase === 'write' ? 'arr-on' : ''}`} style={{ '--arr': 'var(--accent)' }} />
            <div className={`c-arrow c-right ${sim.t2.phase === 'write' ? 'arr-on' : ''}`} style={{ '--arr': 'var(--manual)' }} />
          </div>
        </div>

        <ThreadLane color="var(--manual)" label="T2" phase={sim.t2.phase} register={sim.t2.register} />
      </div>

      {/* Stats row */}
      <div className="race-stats">
        <div className="stat-pill">
          <span className="sp-label">Раунд</span>
          <span className="sp-val sp-neutral">{sim.round}/{ROUNDS}</span>
        </div>
        <div className="stat-pill">
          <span className="sp-label">Очаквано</span>
          <span className="sp-val sp-neutral">{sim.expected}</span>
        </div>
        <div className="stat-pill">
          <span className="sp-label">Реално</span>
          <span className="sp-val" style={{ color: sim.mode === 'safe' ? 'var(--manual)' : sim.expected > 0 ? 'var(--mutex)' : 'var(--text)' }}>
            {sim.counter}
          </span>
        </div>
        {sim.mode === 'unsafe' && sim.expected > 0 && (
          <>
            <div className="stat-pill">
              <span className="sp-label">Загубени</span>
              <span className="sp-val" style={{ color: 'var(--mutex)' }}>{lost}</span>
            </div>
            <div className="stat-pill">
              <span className="sp-label">Точност</span>
              <span className="sp-val" style={{ color: accuracy < 70 ? 'var(--mutex)' : 'var(--auto)' }}>{accuracy}%</span>
            </div>
          </>
        )}
        {sim.mode === 'safe' && (
          <div className="stat-pill">
            <span className="sp-label">Точност</span>
            <span className="sp-val" style={{ color: 'var(--manual)' }}>100%</span>
          </div>
        )}
      </div>

      {/* Divergence graph */}
      {sim.graphPoints.length > 1 && (
        <div className="graph-section">
          <div className="graph-legend">
            <span className="gl-item">
              <svg width="22" height="10"><line x1="0" y1="5" x2="22" y2="5" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" strokeDasharray="4,3" /></svg>
              Очаквано
            </span>
            <span className="gl-item">
              <svg width="22" height="10">
                <line x1="0" y1="5" x2="22" y2="5" stroke={sim.mode === 'safe' ? 'var(--manual)' : 'var(--mutex)'} strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              Реално
            </span>
          </div>
          <MiniGraph points={sim.graphPoints} mode={sim.mode} />
        </div>
      )}

      {/* Verdict */}
      {sim.done && (
        <div className={`verdict ${sim.mode === 'unsafe' ? 'v-bad' : 'v-good'}`}>
          <span className="v-icon">{sim.mode === 'unsafe' ? <Warning size={16} weight="duotone" /> : <Check size={16} weight="bold" />}</span>
          <div>
            {sim.mode === 'unsafe' ? (
              <>
                <span className="v-title">Race Condition!</span>
                {' '}Загубени <strong>{lost}</strong> инкрементa от {sim.expected}. Двата thread-а са презаписали един и същ резултат <strong>{sim.conflicts}</strong> пъти.
              </>
            ) : (
              <>
                <span className="v-title">Перфектен резултат!</span>
                {' '}lock гарантира атомарност — всички {sim.expected} инкремента са отчетени точно веднъж.
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
