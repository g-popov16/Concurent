import { useState } from 'react'
import './FlowChart.css'

const scenarios = [
  {
    id: 1,
    text: 'Два различни процеса достъпват един споделен файл и не трябва да пишат едновременно.',
    answer: 'mutex',
    reason: 'Mutex с "Global\\\\" prefix: thread affinity гарантира, че само притежателят отключва. Работи cross-process.',
  },
  {
    id: 2,
    text: 'Producer нишка добавя заявки в опашка. Consumer нишка трябва да се събуди за всяка заявка поотделно.',
    answer: 'auto',
    reason: 'AutoResetEvent: всяко Set() събужда точно един consumer. Броят сигнали = брой обработени заявки.',
  },
  {
    id: 3,
    text: '8 worker thread-а трябва да стартират обработка едновременно след като конфигурацията се зареди.',
    answer: 'manual',
    reason: 'ManualResetEvent: един Set() отваря портата за всички 8 thread-а едновременно.',
  },
  {
    id: 4,
    text: 'Приложение за desktop трябва да се стартира само в един екземпляр.',
    answer: 'mutex',
    reason: 'Named Mutex с initiallyOwned: true. Ако createdNew е false — друг екземпляр вече работи.',
  },
  {
    id: 5,
    text: 'Scheduler трябва да събуди точно един от 5-те idle worker thread-а при нова задача.',
    answer: 'auto',
    reason: 'AutoResetEvent: Set() пуска точно един чакащ thread, reset-ва автоматично.',
  },
  {
    id: 6,
    text: 'Трябва да изчакаш 3 различни сигнала (от 3 различни thread-а) и да продължиш след поне един.',
    answer: 'any',
    reason: 'WaitHandle.WaitAny() с масив от 3 handles — продължава при първия сигнализиран.',
  },
]

const labels = {
  mutex:  { label: '🔒 Mutex',          color: 'var(--mutex)' },
  auto:   { label: '🚪 AutoResetEvent', color: 'var(--auto)'  },
  manual: { label: '🚦 ManualResetEvent', color: 'var(--manual)' },
  any:    { label: '⏳ WaitAny()',       color: 'var(--accent)' },
}

export default function FlowChart() {
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)

  const scenario = scenarios.find(s => s.id === selected)

  return (
    <div className="fc-wrap">
      <div className="fc-scenarios">
        <div className="tutorial-card fc-tutorial">
          <span className="tutorial-step">2</span>
          <div>
            <div className="tutorial-title">Пробвай да решиш преди да покажеш отговора.</div>
            <div className="tutorial-text">Питай се: между процеси ли е, един ли трябва да мине, или всички чакат общ старт?</div>
          </div>
        </div>

        {scenarios.map(s => (
          <button
            key={s.id}
            className={`fc-scenario ${selected === s.id ? 'active' : ''}`}
            onClick={() => { setSelected(s.id); setRevealed(false) }}
          >
            <span className="fc-num">{s.id}</span>
            <span className="fc-text">{s.text}</span>
          </button>
        ))}
      </div>

      {scenario && (
        <div className="fc-result">
          {!revealed ? (
            <button className="fc-reveal-btn" onClick={() => setRevealed(true)}>
              Покажи отговора
            </button>
          ) : (
            <div className="fc-answer" style={{ '--ans-color': labels[scenario.answer].color }}>
              <div className="fc-answer-label">{labels[scenario.answer].label}</div>
              <p className="fc-reason">{scenario.reason}</p>
            </div>
          )}
        </div>
      )}

      {!scenario && (
        <div className="fc-empty">Избери сценарий от списъка</div>
      )}
    </div>
  )
}
