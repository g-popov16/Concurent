import { CaretLeft, CaretRight, List, Notepad, BookOpen } from '@phosphor-icons/react'
import './Navigation.css'

export default function Navigation({ current, total, onPrev, onNext, onTOC, onPlan, onNotes, onHelp, notesActive, planActive }) {
  const pct = Math.round(((current + 1) / total) * 100)

  return (
    <nav className="nav-bar">
      <div className="nav-progress-track">
        <div className="nav-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="nav-left">
        <button className={`nav-icon-btn ${planActive ? 'active-plan' : ''}`} onClick={onPlan} title="План на урока (L)">
          <BookOpen size={16} weight="regular" />
        </button>
        <button className="nav-icon-btn" onClick={onTOC} title="Съдържание (Esc)">
          <List size={16} weight="regular" />
        </button>
      </div>

      <div className="nav-center">
        <button className="nav-arrow" onClick={onPrev} disabled={current === 0} aria-label="Предишен">
          <CaretLeft size={16} weight="bold" />
        </button>

        <div className="nav-counter">
          <span className="nav-current">{current + 1}</span>
          <span className="nav-sep">/</span>
          <span className="nav-total">{total}</span>
        </div>

        <div className="nav-dots" aria-hidden="true">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={`nav-dot ${i === current ? 'active' : i < current ? 'past' : ''}`} />
          ))}
        </div>

        <button className="nav-arrow" onClick={onNext} disabled={current === total - 1} aria-label="Следващ">
          <CaretRight size={16} weight="bold" />
        </button>
      </div>

      <div className="nav-right">
        <button
          className={`nav-icon-btn ${notesActive ? 'active-notes' : ''}`}
          onClick={onNotes}
          title="Бележки (S)"
        >
          <Notepad size={16} weight="regular" />
        </button>
        <button className="nav-icon-btn nav-help" onClick={onHelp} title="Клавиши (?)">
          <span className="nav-key">?</span>
        </button>
      </div>
    </nav>
  )
}
