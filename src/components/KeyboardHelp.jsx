import { motion } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import './KeyboardHelp.css'

const shortcuts = [
  { keys: ['→', '↓', 'Space'], label: 'Следващ слайд' },
  { keys: ['←', '↑'],          label: 'Предишен слайд' },
  { keys: ['G'],                label: 'Следваща игра' },
  { keys: ['S'],                label: 'Бележки за лектора' },
  { keys: ['L'],                label: 'План на урока' },
  { keys: ['F'],                label: 'Fullscreen' },
  { keys: ['Esc'],              label: 'Съдържание' },
  { keys: ['P'],                label: 'Учебен план' },
  { keys: ['?'],                label: 'Тази помощ' },
]

export default function KeyboardHelp({ onClose }) {
  return (
    <motion.div
      className="overlay-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
    >
      <motion.div
        className="kh-panel"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
      >
        <div className="kh-header">
          <span className="kh-title">Клавишни комбинации</span>
          <button className="kh-close" onClick={onClose}><X size={13} weight="bold" /></button>
        </div>
        <ul className="kh-list">
          {shortcuts.map((s, i) => (
            <li key={i} className="kh-item">
              <div className="kh-keys">
                {s.keys.map(k => <kbd key={k} className="kh-key">{k}</kbd>)}
              </div>
              <span className="kh-label">{s.label}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  )
}
