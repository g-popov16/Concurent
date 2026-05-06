import { useState } from 'react'
import './Quiz.css'

const DD_QUESTIONS = [
  {
    id: 'dd1',
    scenario: 'Windows service и desktop tool пишат в един и същ лог файл от различни процеси. Трябва ownership и cross-process заключване.',
    answer: 'mutex',
  },
  {
    id: 'dd2',
    scenario: '8 worker thread-а чакат конфигурация. След зареждане всички текущи и бъдещи WaitOne() трябва да минават до нов Reset().',
    answer: 'manual',
  },
  {
    id: 'dd3',
    scenario: 'Producer добавя точно една задача в опашка. Само един consumer трябва да се събуди за всяко Set(), после сигналът да се затвори.',
    answer: 'auto',
  },
]

const MC_QUESTIONS = [
  {
    id: 'mc1',
    question: 'Кое поведение е най-точно за WaitHandle.WaitAny(handles) при няколко сигнализирани handles?',
    options: [
      'Връща масив с всички сигнализирани индекси',
      'Връща един индекс; ако няколко са готови, не трябва да разчиташ на бизнес ред',
      'Изчаква всички, но връща първия в масива',
      'Автоматично reset-ва всички handles',
    ],
    answer: 1,
  },
  {
    id: 'mc2',
    question: 'Какво е правилното действие при AbandonedMutexException?',
    options: [
      'Игнорираш я; mutex-ът не е придобит',
      'Знаеш, че mutex-ът е придобит, но защитените данни може да са неконсистентни',
      'Извикваш Set(), за да събудиш чакащите thread-ове',
      'Извикваш ReleaseMutex() от произволен thread',
    ],
    answer: 1,
  },
  {
    id: 'mc3',
    question: 'Къде е най-сериозният bug в pattern-а `mtx.WaitOne(); DoWork(); mtx.ReleaseMutex();`?',
    options: [
      'Mutex не поддържа WaitOne()',
      'ReleaseMutex() трябва да е във finally, иначе exception в DoWork() може да остави mutex-а заключен',
      'ReleaseMutex() трябва да се извика преди DoWork()',
      'WaitOne() винаги връща false',
    ],
    answer: 1,
  },
]

const PRIMITIVE_LABELS = {
  mutex:  { label: '🔒 Mutex',           color: 'var(--mutex)' },
  auto:   { label: '🚪 AutoResetEvent',  color: 'var(--auto)'  },
  manual: { label: '🚦 ManualResetEvent', color: 'var(--manual)' },
}

export default function Quiz() {
  const [ddAnswers, setDdAnswers] = useState({})
  const [mcAnswers, setMcAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [dragging, setDragging] = useState(null)
  const [picked, setPicked] = useState(null)

  const onDragStart = (e, id) => {
    setDragging(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
    e.currentTarget.classList.add('dragging')
  }

  const onDrop = (e, zone) => {
    e.preventDefault()
    const draggedId = e.dataTransfer.getData('text/plain') || dragging || picked
    if (draggedId) {
      setDdAnswers(a => ({ ...a, [draggedId]: zone }))
      setDragging(null)
      setPicked(null)
    }
  }

  const onDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }
  const onDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging')
    setDragging(null)
  }

  const assignPicked = (zone) => {
    if (!picked || submitted) return
    setDdAnswers(a => ({ ...a, [picked]: zone }))
    setPicked(null)
  }

  const submit = () => setSubmitted(true)

  const reset = () => {
    setDdAnswers({})
    setMcAnswers({})
    setSubmitted(false)
    setPicked(null)
  }

  const ddScore = DD_QUESTIONS.filter(q => ddAnswers[q.id] === q.answer).length
  const mcScore = MC_QUESTIONS.filter(q => mcAnswers[q.id] === q.answer).length
  const total = ddScore + mcScore

  return (
    <div className="quiz-wrap">
      <div className="quiz-body">
        {/* Drag-drop section */}
        <div className="quiz-section">
          <div className="quiz-section-title">Drag & Drop — Сценарий → Примитива</div>
          <div className="quiz-dd">
            <div className="dd-scenarios">
              {DD_QUESTIONS.map(q => {
                const placed = ddAnswers[q.id]
                const correct = submitted ? q.answer === placed : null
                return (
                  <div
                    key={q.id}
                    className={`dd-card ${picked === q.id ? 'picked' : ''} ${placed ? 'placed' : ''} ${submitted ? (correct ? 'correct' : 'wrong') : ''}`}
                    draggable={!submitted}
                    onDragStart={e => onDragStart(e, q.id)}
                    onDragEnd={onDragEnd}
                    onClick={() => !submitted && setPicked(p => p === q.id ? null : q.id)}
                    aria-pressed={picked === q.id}
                  >
                    <span className="dd-drag-hint">⠿</span>
                    <span className="dd-text">{q.scenario}</span>
                    {placed && (
                      <span className="dd-placed-badge" style={{ color: PRIMITIVE_LABELS[placed].color }}>
                        {PRIMITIVE_LABELS[placed].label}
                      </span>
                    )}
                    {submitted && (
                      <span className={`dd-result-icon`}>{correct ? '✓' : `✗ → ${PRIMITIVE_LABELS[q.answer].label}`}</span>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="dd-zones">
              {Object.entries(PRIMITIVE_LABELS).map(([key, { label, color }]) => (
                <div
                  key={key}
                  className={`dd-zone ${dragging || picked ? 'droppable' : ''}`}
                  style={{ '--zone-color': color }}
                  onDrop={e => onDrop(e, key)}
                  onDragOver={onDragOver}
                  onClick={() => assignPicked(key)}
                >
                  <span className="dd-zone-label" style={{ color }}>{label}</span>
                  <div className="dd-zone-cards">
                    {DD_QUESTIONS.filter(q => ddAnswers[q.id] === key).map(q => (
                      <div key={q.id} className="dd-zone-chip">
                        {q.scenario.slice(0, 40)}…
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Multiple choice */}
        <div className="quiz-section">
          <div className="quiz-section-title">Multiple Choice</div>
          <div className="mc-questions">
            {MC_QUESTIONS.map((q, qi) => (
              <div key={q.id} className="mc-question">
                <div className="mc-q-text">{qi + 4}. {q.question}</div>
                <div className="mc-options">
                  {q.options.map((opt, oi) => {
                    const selected = mcAnswers[q.id] === oi
                    const correct = submitted ? oi === q.answer : null
                    const wrong = submitted && selected && oi !== q.answer
                    return (
                      <button
                        key={oi}
                        className={`mc-opt ${selected ? 'selected' : ''} ${submitted && correct ? 'correct' : ''} ${wrong ? 'wrong' : ''}`}
                        onClick={() => !submitted && setMcAnswers(a => ({ ...a, [q.id]: oi }))}
                        disabled={submitted}
                      >
                        <span className="mc-letter">{String.fromCharCode(65 + oi)}</span>
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="quiz-footer">
        {!submitted ? (
          <button
            className="quiz-submit-btn"
            onClick={submit}
            disabled={Object.keys(ddAnswers).length < 3 || Object.keys(mcAnswers).length < 3}
          >
            Провери резултата
          </button>
        ) : (
          <div className="quiz-score-row">
            <div className="quiz-score">
              <span className="score-num">{total}</span>
              <span className="score-sep">/</span>
              <span className="score-den">6</span>
            </div>
            <div className="quiz-breakdown">
              <span>Drag & Drop: {ddScore}/3</span>
              <span>Multiple Choice: {mcScore}/3</span>
            </div>
            <button className="quiz-retry-btn" onClick={reset}>Опитай пак</button>
          </div>
        )}
      </div>
    </div>
  )
}
