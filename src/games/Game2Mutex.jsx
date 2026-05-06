import { useState, useEffect, useRef } from 'react'
import './Game2Mutex.css'

const THREAD_COLORS = [
  { bg: '#58d5ff20', fg: '#58d5ff', border: '#58d5ff80' },
  { bg: '#ff6b5f20', fg: '#ff6b5f', border: '#ff6b5f80' },
  { bg: '#ffd16620', fg: '#ffd166', border: '#ffd16680' },
  { bg: '#42e6a420', fg: '#42e6a4', border: '#42e6a480' },
]

export default function Game2Mutex() {
  const [queue, setQueue] = useState([0, 1, 2, 3])
  const [holder, setHolder] = useState(null)
  const [done, setDone] = useState([])
  const [log, setLog] = useState([])
  const [toast, setToast] = useState(null)
  const [progress, setProgress] = useState(0)
  const [abandoned, setAbandoned] = useState(false)
  const timerRef = useRef(null)
  const progressRef = useRef(null)

  const addLog = (msg, type = '') => setLog(l => [...l.slice(-12), { msg, type }])

  useEffect(() => {
    if (queue.length > 0 && holder === null) {
      const next = queue[0]
      setTimeout(() => {
        setHolder(next)
        setQueue(q => q.slice(1))
        setProgress(0)
        if (abandoned) {
          addLog(`T${next + 1} → AbandonedMutexException — mutex придобит, но данните са подозрителни`, 'error')
          setAbandoned(false)
        } else {
          addLog(`T${next + 1} → WaitOne() OK — mutex отключен`, 'ok')
        }
      }, 500)
    }
  }, [holder, queue, abandoned])

  const release = (threadId = holder) => {
    if (holder === null) {
      showToast('Няма thread, държащ mutex-а!')
      return
    }
    if (threadId !== holder) {
      addLog(`T${threadId + 1} → ReleaseMutex() отказан — не е owner`, 'error')
      showToast(`T${threadId + 1} не притежава mutex-а. Owner е T${holder + 1}.`)
      return
    }
    clearInterval(timerRef.current)
    clearInterval(progressRef.current)
    addLog(`T${holder + 1} → ReleaseMutex()`, 'release')
    setDone(d => [...d, holder])
    setHolder(null)
    setProgress(0)
  }

  const crashOwner = () => {
    if (holder === null) {
      showToast('Няма owner, който да crash-не.')
      return
    }
    addLog(`T${holder + 1} crash без ReleaseMutex() → abandoned mutex`, 'error')
    setHolder(null)
    setAbandoned(true)
    setProgress(0)
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const reset = () => {
    clearInterval(timerRef.current)
    clearInterval(progressRef.current)
    setQueue([0, 1, 2, 3])
    setHolder(null)
    setDone([])
    setLog([])
    setProgress(0)
    setToast(null)
    setAbandoned(false)
  }

  const threads = [0, 1, 2, 3]

  const getState = (id) => {
    if (id === holder) return 'holding'
    if (done.includes(id)) return 'done'
    if (queue.includes(id)) return 'waiting'
    return 'idle'
  }

  return (
    <div className="g2-wrap">
      <div className="g2-main">
        <div className="tutorial-card">
          <span className="tutorial-step">!</span>
          <div>
            <div className="tutorial-title">Тествай owner правилото.</div>
            <div className="tutorial-text">Само thread-ът в критичната секция може да извика ReleaseMutex(). Натисни грешен T Release, после Crash owner, за да видиш abandoned mutex.</div>
          </div>
        </div>

        <div className="g2-arena">
          <div className="g2-queue-col">
            <div className="g2-col-label">Чакащи (WaitOne)</div>
            <div className="g2-queue">
              {queue.map(id => (
                <div key={id} className="g2-thread-card waiting">
                  <div className="thread" style={{ background: THREAD_COLORS[id].bg, color: THREAD_COLORS[id].fg, borderColor: THREAD_COLORS[id].border }}>
                    T{id + 1}
                  </div>
                  <span className="g2-tc-label">чака…</span>
                </div>
              ))}
            </div>
          </div>

          <div className="g2-resource-col">
            <div className="g2-col-label">Критична секция</div>
            <div className={`g2-resource ${holder !== null ? 'occupied' : 'free'}`}>
              <div className="g2-lock-icon">{holder !== null ? '🔒' : '🔓'}</div>
              {holder !== null ? (
                <div className="g2-holder">
                  <div className="thread" style={{ background: THREAD_COLORS[holder].bg, color: THREAD_COLORS[holder].fg, borderColor: THREAD_COLORS[holder].border }}>
                    T{holder + 1}
                  </div>
                  <span>В критична секция</span>
                </div>
              ) : (
                <span className="g2-free-label">Свободно</span>
              )}
            </div>

            <button
              className="g2-release-btn"
              onClick={() => release(holder)}
              disabled={holder === null}
            >
              Owner ReleaseMutex()
            </button>
            <button
              className="g2-crash-btn"
              onClick={crashOwner}
              disabled={holder === null}
            >
              Crash owner
            </button>
          </div>

          <div className="g2-done-col">
            <div className="g2-col-label">Завършили</div>
            <div className="g2-done-list">
              {done.map(id => (
                <div key={id} className="g2-thread-card done">
                  <div className="thread" style={{ background: THREAD_COLORS[id].bg, color: THREAD_COLORS[id].fg, borderColor: THREAD_COLORS[id].border }}>
                    T{id + 1}
                  </div>
                  <span className="g2-tc-label">✓</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="g2-controls">
          <button className="g2-reset-btn" onClick={reset}>Рестартирай</button>
          <div className="g2-owner-buttons">
            {threads.map(id => (
              <button
                key={id}
                className={`g2-owner-btn ${id === holder ? 'owner' : ''}`}
                onClick={() => release(id)}
                disabled={holder === null || done.includes(id)}
              >
                T{id + 1} Release
              </button>
            ))}
          </div>
          {done.length === 4 && (
            <div className="g2-complete">Всички 4 thread-а минаха успешно!</div>
          )}
        </div>
      </div>

      <div className="g2-log">
        <div className="g2-log-header">Лог</div>
        {log.length === 0
          ? <div className="g2-log-empty">Изчаквай автоматичното WaitOne()…</div>
          : log.map((l, i) => (
            <div key={i} className={`g2-log-entry ${l.type}`}>{l.msg}</div>
          ))
        }
      </div>

      {toast && (
        <div className="g2-toast">
          <strong>ApplicationException:</strong> {toast}
        </div>
      )}
    </div>
  )
}
