import { motion } from 'framer-motion'
import { X, BookOpen } from '@phosphor-icons/react'
import './StudyPlan.css'

const PLAN = [
  {
    title: 'Синхронизация и Race Condition',
    color: '#7c6af5',
    items: [
      'Защо е нужна синхронизация: споделена памет + паралелни нишки = неопределено поведение',
      'Race condition: операцията counter++ се разгъва на READ → MODIFY → WRITE — три стъпки, не една',
      'Lost-write сценарий: T1 и T2 четат едно и също, пишат едно и също, губим едно увеличение',
      'Dirty-read: T1 чете данни, докато T2 ги модифицира — резултатът е неконсистентен',
      'Deadlock: A чака B, B чака A — двете нишки блокират завинаги',
      'Managed примитиви (lock, Monitor) vs Unmanaged (WaitHandle йерархия)',
    ],
  },
  {
    title: 'WaitHandle — базов клас',
    color: '#5ba4f5',
    items: [
      'WaitHandle е абстрактен клас — обвива Windows kernel synchronization object',
      'По-скъп от lock/Monitor: изисква syscall (kernel mode switch ~200–500 ns)',
      'Главно предимство: cross-process достъп чрез именувани handles',
      'WaitOne() — блокира докато обектът стане сигнализиран (или изтече timeout)',
      'WaitAll(handles) — чака ВСИЧКИ handles в масива да бъдат сигнализирани едновременно',
      'WaitAny(handles) — чака НАЙ-МАЛКО ЕДИН handle; връща индекса на първия готов',
      'Ограничение WaitAll/WaitAny: максимум 64 handle-а в масива',
      'Сигнализиран стейт = "отворена порта"; несигнализиран = "заключена порта"',
    ],
  },
  {
    title: 'Mutex',
    color: '#e8622a',
    items: [
      'Thread affinity: само нишката, придобила Mutex-а, може да го освободи',
      'ReleaseMutex() задължително в блок finally — иначе exception заключва Mutex завинаги',
      'Named Mutex: префикс "Global\\\\" за cross-session; "Local\\\\" за текущата сесия',
      'createdNew = false при new Mutex(true, name, out created) означава — вече съществува',
      'AbandonedMutexException: предишен owner е приключил без Release — данните може да са corrupted',
      'Рекурсивно заключване: един owner може да извика WaitOne() многократно, но трябва еднакъв брой Release',
      'Използвай lock{} вместо Mutex за in-process синхронизация — 10–50× по-бърз',
    ],
  },
  {
    title: 'Semaphore',
    color: '#b57bee',
    items: [
      'Брояч 0..N: WaitOne() намалява брояча; Release() го увеличава',
      'Няма thread affinity — всяка нишка може да освободи слот (за разлика от Mutex)',
      'Semaphore(initialCount, maximumCount): initialCount = стартов брояч, maximumCount = лимит',
      'Release(n) освобождава n слота наведнъж — полезно за bulk operations',
      'SemaphoreSlim: по-лек in-process вариант; поддържа async WaitAsync()',
      'Типична употреба: connection pool, HTTP rate limiting, ограничен паралелизъм',
    ],
  },
  {
    title: 'AutoResetEvent',
    color: '#ffd166',
    items: [
      'Set() → сигнализира събитието; събужда точно ЕДИН чакащ WaitOne()',
      'Автоматично се затваря (reset) веднага след като пуска нишката',
      'Ако няма чакащи при Set() — сигналът се "запазва" за следващия WaitOne()',
      'false = несигнализиран при new AutoResetEvent(false) — нишките чакат',
      'true = вече сигнализиран при new AutoResetEvent(true) — първата нишка минава без чакане',
      'Типично: producer-consumer, scheduler → worker (1:1 сигнал)',
    ],
  },
  {
    title: 'ManualResetEvent',
    color: '#42e6a4',
    items: [
      'Set() отваря портата за ВСИЧКИ чакащи нишки едновременно (broadcast)',
      'Портата остава отворена: всички бъдещи WaitOne() минават незабавно докато не се извика Reset()',
      'Reset() ръчно затваря събитието — нишките отново ще чакат',
      'Сценарий: зареди конфигурация → Set() → 8 worker нишки стартират едновременно',
      'Внимание: ако Set() е извикан преди WaitOne() — WaitOne() не блокира (портата е отворена)',
      'Concurrent Reset() и WaitOne(): ако Reset() е по-бърз, следващият WaitOne() блокира',
    ],
  },
  {
    title: 'Добри практики и избор',
    color: '#3ec88a',
    items: [
      'Правило #1: lock{} за in-process → Monitor → SemaphoreSlim → WaitHandle (нарастваща цена)',
      'Правило #2: try { WaitOne() } finally { Release() } — задължителен pattern',
      'Никога не освобождавай от finally ако WaitOne() е timeout-нал (провери return value)',
      'Предпочитай именувани примитиви само когато наистина имаш нужда от cross-process',
      'Тествай за AbandonedMutexException при Mutex — защитените данни може да са некоректни',
      'lock{} = syntactic sugar за Monitor.Enter/Exit с неявен finally',
      'BlockingCollection<T> вместо ръчно Queue + AutoResetEvent за producer-consumer',
    ],
  },
]

export default function StudyPlan({ slide, onClose }) {
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
        className="sp-panel"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
      >
        <div className="sp-header">
          <div className="sp-header-left">
            <BookOpen size={18} weight="regular" style={{ color: 'var(--accent)' }} />
            <h2 className="sp-title">Учебен план</h2>
          </div>
          <button className="sp-close" onClick={onClose}>
            <X size={14} weight="bold" />
          </button>
        </div>

        <div className="sp-body">
          {slide?.speakerNotes && (
            <div className="sp-notes-section">
              <div className="sp-section-title" style={{ '--sc': 'var(--accent)' }}>
                <span className="sp-dot" />
                Бележки — {slide.title}
              </div>
              <p className="sp-notes-text">{slide.speakerNotes}</p>
            </div>
          )}
          {PLAN.map((section, si) => (
            <div key={si} className="sp-section">
              <div className="sp-section-title" style={{ '--sc': section.color }}>
                <span className="sp-dot" />
                {section.title}
              </div>
              <ul className="sp-items">
                {section.items.map((item, ii) => (
                  <li key={ii} className="sp-item">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="sp-footer">
          P — затвори
        </div>
      </motion.div>
    </motion.div>
  )
}
