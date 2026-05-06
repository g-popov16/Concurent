import { parts } from '../data/slideData.jsx'
import './Progress.css'

export default function Progress({ slides, current, goTo }) {
  const activePart = parts.find(p => current >= p.range[0] && current <= p.range[1])

  return (
    <aside className="progress-bar">
      {parts.map((part) => {
        const isActive = activePart?.id === part.id
        const isPast = parts.indexOf(part) < parts.indexOf(activePart)
        return (
          <button
            key={part.id}
            className={`part-marker ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}
            style={{ '--part-color': part.color }}
            onClick={() => goTo(part.range[0])}
            title={`Part ${part.id} — ${part.title}`}
          >
            <span className="part-roman">{part.id}</span>
          </button>
        )
      })}
    </aside>
  )
}
