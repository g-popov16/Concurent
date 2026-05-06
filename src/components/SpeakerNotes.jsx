import './SpeakerNotes.css'

export default function SpeakerNotes({ notes, onClose }) {
  return (
    <div className="notes-overlay" role="dialog" aria-label="Бележки за лектора">
      <div className="notes-panel">
        <div className="notes-header">
          <span className="notes-label">Бележки</span>
          <button className="notes-close" onClick={onClose} aria-label="Затвори">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <p className="notes-text">{notes || 'Няма бележки за тази страница.'}</p>
        <div className="notes-hint">S за затваряне</div>
      </div>
    </div>
  )
}
