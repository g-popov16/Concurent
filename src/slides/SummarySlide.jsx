import { useEffect, useState } from 'react'
import InheritanceTree from './InheritanceTree.jsx'
import './SummarySlide.css'

export default function SummarySlide({ slide }) {
  const [show, setShow] = useState(false)
  useEffect(() => { setTimeout(() => setShow(true), 600) }, [])

  return (
    <div className="summary-slide">
      <div className="summary-header">
        <span className="summary-part">Part {slide.part}</span>
        <h2 className="summary-title">{slide.title}</h2>
      </div>
      <div className="summary-body">
        <div className="summary-tree">
          <InheritanceTree slide={slide} />
        </div>
        {show && (
          <div className="summary-takeaways">
            {slide.sections?.[0]?.items.map((item, i) => (
              <div key={i} className={`takeaway ${item.accent}`} style={{ animationDelay: `${i * 80}ms` }}>
                <span className="takeaway-num">{i + 1}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
