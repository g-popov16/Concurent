import { useEffect, useState } from 'react'
import './InheritanceTree.css'

const nodes = [
  { id: 'wh',  label: 'WaitHandle',        sub: 'abstract', accent: 'accent', delay: 0   },
  { id: 'mtx', label: 'Mutex',             sub: 'Mutual exclusion · thread affinity · cross-process', accent: 'mutex', delay: 200 },
  { id: 'ewh', label: 'EventWaitHandle',   sub: 'parent class for events · named cross-process',     accent: '',      delay: 200 },
  { id: 'are', label: 'AutoResetEvent',    sub: 'Auto reset · one thread per Set()',                 accent: 'auto',  delay: 400 },
  { id: 'mre', label: 'ManualResetEvent',  sub: 'Manual reset · broadcast Set()',                    accent: 'manual',delay: 400 },
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
            <div className="tutorial-text">WaitHandle е общият базов клас. Mutex решава ownership, а EventWaitHandle се разклонява към AutoResetEvent и ManualResetEvent.</div>
          </div>
        </div>
      )}

      <div className="inh-row">
        {visible.has('wh') && (
          <div className={`inh-node root accent`}>
            <span className="inh-label">WaitHandle</span>
            <span className="inh-sub">abstract</span>
          </div>
        )}
      </div>

      {visible.has('wh') && (
        <div className="inh-connector-down" />
      )}

      <div className="inh-branch-row">
        {visible.has('mtx') && (
          <div className="inh-branch-item left">
            <div className="inh-connector-h left" />
            <div className="inh-node mutex">
              <span className="inh-label">Mutex</span>
              <span className="inh-sub">thread affinity · cross-process</span>
            </div>
          </div>
        )}
        {visible.has('ewh') && (
          <div className="inh-branch-item right">
            <div className="inh-connector-h right" />
            <div className="inh-node ewh">
              <span className="inh-label">EventWaitHandle</span>
              <span className="inh-sub">parent class for events</span>
            </div>
          </div>
        )}
      </div>

      {visible.has('ewh') && (
        <div className="inh-connector-down right-aligned" />
      )}

      <div className="inh-leaf-row">
        {visible.has('are') && (
          <div className="inh-branch-item">
            <div className="inh-connector-h left-leaf" />
            <div className="inh-node auto">
              <span className="inh-label">AutoResetEvent</span>
              <span className="inh-sub">auto reset · one thread per Set()</span>
            </div>
          </div>
        )}
        {visible.has('mre') && (
          <div className="inh-branch-item">
            <div className="inh-connector-h right-leaf" />
            <div className="inh-node manual">
              <span className="inh-label">ManualResetEvent</span>
              <span className="inh-sub">manual reset · broadcast Set()</span>
            </div>
          </div>
        )}
      </div>

      {slide?.recap && (
        <div className="inh-legend">
          <span className="legend-item mutex">🔒 Mutex — exclusive ownership</span>
          <span className="legend-item auto">🚪 AutoResetEvent — one-at-a-time</span>
          <span className="legend-item manual">🚦 ManualResetEvent — broadcast</span>
        </div>
      )}
    </div>
  )
}
