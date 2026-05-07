import { useEffect, useState } from 'react'
import './InheritanceTree.css'

const nodes = [
  { id: 'wh',  delay: 0   },
  { id: 'mtx', delay: 200 },
  { id: 'sem', delay: 200 },
  { id: 'ewh', delay: 200 },
  { id: 'are', delay: 400 },
  { id: 'mre', delay: 400 },
]

export default function InheritanceTree({ slide }) {
  const [visible, setVisible] = useState(new Set())

  useEffect(() => {
    setVisible(new Set())
    nodes.forEach(n => {
      setTimeout(() => setVisible(v => new Set([...v, n.id])), n.delay)
    })
  }, [])

  return (
    <div className="inh-tree">
      {!slide?.recap && (
        <div className="tutorial-card inh-tutorial">
          <span className="tutorial-step">?</span>
          <div>
            <div className="tutorial-title">Чети диаграмата отгоре надолу.</div>
            <div className="tutorial-text">WaitHandle е общият базов клас. Mutex и Semaphore решават ownership/брояч, а EventWaitHandle се разклонява към AutoResetEvent и ManualResetEvent.</div>
          </div>
        </div>
      )}

      <div className="inh-row">
        {visible.has('wh') && (
          <div className="inh-node accent">
            <span className="inh-label">WaitHandle</span>
            <span className="inh-sub">abstract</span>
          </div>
        )}
      </div>

      {visible.has('wh') && <div className="inh-connector-down" />}

      <div className="inh-branch-row">
        {visible.has('mtx') && (
          <div className="inh-branch-item">
            <div className="inh-connector-h" />
            <div className="inh-node mutex">
              <span className="inh-label">Mutex</span>
              <span className="inh-sub">thread affinity · cross-process</span>
            </div>
          </div>
        )}

        {visible.has('sem') && (
          <div className="inh-branch-item">
            <div className="inh-connector-h" />
            <div className="inh-node semaphore">
              <span className="inh-label">Semaphore</span>
              <span className="inh-sub">N-count · cross-process</span>
            </div>
          </div>
        )}

        {visible.has('ewh') && (
          <div className="inh-branch-item">
            <div className="inh-connector-h" />
            <div className="inh-node ewh">
              <span className="inh-label">EventWaitHandle</span>
              <span className="inh-sub">parent class for events</span>
            </div>

            {(visible.has('are') || visible.has('mre')) && (
              <>
                <div className="inh-connector-down" />
                <div className="inh-leaf-row">
                  {visible.has('are') && (
                    <div className="inh-branch-item">
                      <div className="inh-connector-h" />
                      <div className="inh-node auto">
                        <span className="inh-label">AutoResetEvent</span>
                        <span className="inh-sub">auto reset · one thread per Set()</span>
                      </div>
                    </div>
                  )}
                  {visible.has('mre') && (
                    <div className="inh-branch-item">
                      <div className="inh-connector-h" />
                      <div className="inh-node manual">
                        <span className="inh-label">ManualResetEvent</span>
                        <span className="inh-sub">manual reset · broadcast Set()</span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {slide?.recap && (
        <div className="inh-legend">
          <span className="legend-item mutex">🔒 Mutex — exclusive ownership</span>
          <span className="legend-item semaphore">🔢 Semaphore — count-based</span>
          <span className="legend-item auto">🚪 AutoResetEvent — one-at-a-time</span>
          <span className="legend-item manual">🚦 ManualResetEvent — broadcast</span>
        </div>
      )}
    </div>
  )
}
