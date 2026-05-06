import { motion } from 'framer-motion'
import { X, Clock, BookOpen, GameController, Code, Exam } from '@phosphor-icons/react'
import './LessonPlan.css'

const agenda = [
  {
    part: 'I', title: 'Основи', duration: 15, color: '#7c6af5',
    items: [
      { label: 'Какво е синхронизация?', slide: 2, type: 'theory' },
      { label: 'Race condition — демо', slide: 3, type: 'demo' },
      { label: 'Управлявана vs Неуправлявана', slide: 4, type: 'theory' },
      { label: 'Kernel objects', slide: 5, type: 'theory' },
      { label: 'Йерархия на класовете', slide: 6, type: 'demo' },
    ],
  },
  {
    part: 'II', title: 'WaitHandle', duration: 10, color: '#5ba4f5',
    items: [
      { label: 'Class WaitHandle', slide: 7, type: 'theory' },
      { label: 'Ключови методи', slide: 8, type: 'theory' },
      { label: 'Игра: WaitAny vs WaitAll', slide: 9, type: 'game' },
    ],
  },
  {
    part: 'III', title: 'Mutex', duration: 20, color: '#e8622a',
    items: [
      { label: 'Mutex — въведение', slide: 10, type: 'theory' },
      { label: 'Кога се използва?', slide: 11, type: 'theory' },
      { label: 'Код: основна употреба', slide: 12, type: 'theory' },
      { label: 'Игра: Ключът от тоалетната', slide: 13, type: 'game' },
      { label: 'Named Mutex', slide: 14, type: 'theory' },
      { label: 'Капани', slide: 15, type: 'theory' },
      { label: 'Предизвикателство: напиши Mutex', slide: 16, type: 'code' },
    ],
  },
  {
    part: 'IV', title: 'EventWaitHandle', duration: 25, color: '#d4952a',
    items: [
      { label: 'EventWaitHandle', slide: 17, type: 'theory' },
      { label: 'AutoResetEvent — въведение', slide: 18, type: 'theory' },
      { label: 'AutoResetEvent — код', slide: 19, type: 'theory' },
      { label: 'Игра: Турникетът', slide: 20, type: 'game' },
      { label: 'ManualResetEvent — въведение', slide: 21, type: 'theory' },
      { label: 'ManualResetEvent — код', slide: 22, type: 'theory' },
      { label: 'Игра: Светофарът', slide: 23, type: 'game' },
      { label: 'Предизвикателство: напиши AutoResetEvent', slide: 24, type: 'code' },
    ],
  },
  {
    part: 'V', title: 'Сравнение', duration: 15, color: '#3ec88a',
    items: [
      { label: 'Сравнителна таблица', slide: 25, type: 'demo' },
      { label: 'Кога кое да използвам?', slide: 26, type: 'demo' },
      { label: 'Често срещани грешки', slide: 27, type: 'theory' },
      { label: 'Performance', slide: 28, type: 'theory' },
      { label: 'Финален тест', slide: 29, type: 'quiz' },
    ],
  },
  {
    part: 'VI', title: 'Заключение', duration: 5, color: '#6b7280',
    items: [
      { label: 'Обобщение', slide: 30, type: 'demo' },
      { label: 'Въпроси', slide: 31, type: 'theory' },
    ],
  },
]

const typeIcon = (type) => {
  switch (type) {
    case 'game': return <GameController size={12} weight="fill" />
    case 'code': return <Code size={12} weight="bold" />
    case 'quiz': return <Exam size={12} weight="bold" />
    case 'demo': return <BookOpen size={12} weight="regular" />
    default:     return null
  }
}

const totalMins = agenda.reduce((s, p) => s + p.duration, 0)

export default function LessonPlan({ current, goTo, onClose }) {
  const slideToIndex = (slideNum) => slideNum - 1

  return (
    <motion.div
      className="overlay-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="lp-panel"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
      >
        <div className="lp-header">
          <div className="lp-header-left">
            <BookOpen size={18} weight="regular" style={{ color: 'var(--manual)' }} />
            <h2 className="lp-title">План на урока</h2>
          </div>
          <div className="lp-header-right">
            <div className="lp-total">
              <Clock size={13} weight="regular" />
              <span>{totalMins} мин.</span>
            </div>
            <button className="lp-close" onClick={onClose}>
              <X size={14} weight="bold" />
            </button>
          </div>
        </div>

        <div className="lp-body">
          {agenda.map(part => (
            <div key={part.part} className="lp-part">
              <div className="lp-part-header" style={{ '--pc': part.color }}>
                <span className="lp-part-id">Part {part.part}</span>
                <span className="lp-part-name">{part.title}</span>
                <span className="lp-part-dur">
                  <Clock size={11} weight="regular" />
                  {part.duration} мин.
                </span>
              </div>
              <ul className="lp-items">
                {part.items.map((item) => {
                  const idx = slideToIndex(item.slide)
                  const isCurrent = idx === current
                  const isPast    = idx < current
                  return (
                    <li key={item.slide}>
                      <button
                        className={`lp-item ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''} type-${item.type}`}
                        onClick={() => goTo(idx)}
                        style={{ '--pc': part.color }}
                      >
                        <span className="lp-item-num">{item.slide}</span>
                        <span className="lp-item-label">{item.label}</span>
                        {item.type !== 'theory' && (
                          <span className={`lp-type-badge ${item.type}`}>
                            {typeIcon(item.type)}
                          </span>
                        )}
                        {isCurrent && <span className="lp-current-dot" />}
                        {isPast && <span className="lp-check">✓</span>}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="lp-footer">
          L — затвори · кликни ред за навигация
        </div>
      </motion.div>
    </motion.div>
  )
}
