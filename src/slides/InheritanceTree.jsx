import { useEffect, useState } from 'react'
import { Lock, Hash, DoorOpen, Broadcast } from '@phosphor-icons/react'
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

  const show = (id) => visible.has(id)

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

      {/* Root */}
      <div className="inh-row">
        {show('wh') && (
          <div className="inh-node accent">
            <span className="inh-label">WaitHandle</span>
            <span className="inh-sub">абстрактен базов клас</span>
          </div>
        )}
      </div>

      {show('wh') && <div className="inh-vline" />}

      {/* 3-column grid — EWH sub-tree lives inside column 3 */}
      {(show('mtx') || show('sem') || show('ewh')) && (
        <div className="inh-branch-grid">
          <div className="inh-branch-item">
            {show('mtx') && (
              <>
                <div className="inh-vline" />
                <div className="inh-node mutex">
                  <span className="inh-label">Mutex</span>
                  <span className="inh-sub">нишков афинитет · cross-process</span>
                </div>
              </>
            )}
          </div>

          <div className="inh-branch-item">
            {show('sem') && (
              <>
                <div className="inh-vline" />
                <div className="inh-node semaphore">
                  <span className="inh-label">Semaphore</span>
                  <span className="inh-sub">N-брояч · cross-process</span>
                </div>
              </>
            )}
          </div>

          <div className="inh-branch-item">
            {show('ewh') && (
              <>
                <div className="inh-vline" />
                <div className="inh-node ewh">
                  <span className="inh-label">EventWaitHandle</span>
                  <span className="inh-sub">родителски клас за събития</span>
                </div>
                {(show('are') || show('mre')) && (
                  <>
                    <div className="inh-vline" />
                    <div className="inh-leaf-row">
                      {show('are') && (
                        <div className="inh-branch-item">
                          <div className="inh-vline" />
                          <div className="inh-node auto">
                            <span className="inh-label">AutoResetEvent</span>
                            <span className="inh-sub">авто ресет · един thread на Set()</span>
                          </div>
                        </div>
                      )}
                      {show('mre') && (
                        <div className="inh-branch-item">
                          <div className="inh-vline" />
                          <div className="inh-node manual">
                            <span className="inh-label">ManualResetEvent</span>
                            <span className="inh-sub">ръчен ресет · broadcast Set()</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {slide?.recap && (
        <div className="inh-legend">
          <span className="legend-item mutex"><Lock size={13} weight="duotone" /> Mutex — изключително притежание</span>
          <span className="legend-item semaphore"><Hash size={13} weight="duotone" /> Semaphore — брояч</span>
          <span className="legend-item auto"><DoorOpen size={13} weight="duotone" /> AutoResetEvent — един по един</span>
          <span className="legend-item manual"><Broadcast size={13} weight="duotone" /> ManualResetEvent — broadcast</span>
        </div>
      )}
    </div>
  )
}
