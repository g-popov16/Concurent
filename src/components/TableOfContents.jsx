import { parts } from '../data/slideData.jsx'
import './TableOfContents.css'

export default function TableOfContents({ slides, current, goTo, onClose }) {
  return (
    <div className="toc-overlay" onClick={onClose}>
      <div className="toc-panel" onClick={e => e.stopPropagation()}>
        <div className="toc-header">
          <span className="toc-title">Съдържание</span>
          <button className="toc-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="toc-body">
          {parts.map(part => {
            const partSlides = slides.filter((_, i) => i >= part.range[0] && i <= part.range[1])
            return (
              <div key={part.id} className="toc-part">
                <div className="toc-part-header" style={{ '--part-color': part.color }}>
                  <span className="toc-part-id">Part {part.id}</span>
                  <span className="toc-part-name">{part.title}</span>
                </div>
                <ul className="toc-slides">
                  {partSlides.map((slide, localIdx) => {
                    const globalIdx = part.range[0] + localIdx
                    const isCurrent = globalIdx === current
                    return (
                      <li key={slide.id}>
                        <button
                          className={`toc-item ${isCurrent ? 'active' : ''} ${slide.type === 'game' || slide.type === 'quiz' ? 'is-game' : ''}`}
                          onClick={() => goTo(globalIdx)}
                        >
                          <span className="toc-num">{slide.id}</span>
                          <span className="toc-item-title">{slide.title}</span>
                          {(slide.type === 'game') && <span className="toc-badge game">Игра</span>}
                          {slide.type === 'quiz' && <span className="toc-badge quiz">Тест</span>}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>

        <div className="toc-footer">
          Esc за затваряне · ← → за навигация · G следваща игра · S бележки
        </div>
      </div>
    </div>
  )
}
