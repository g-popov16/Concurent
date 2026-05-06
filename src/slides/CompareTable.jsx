import { useState } from 'react'
import './CompareTable.css'

const rows = [
  { feature: 'Thread affinity',    mutex: 'Да',          auto: 'Не',        manual: 'Не'        },
  { feature: 'Reset mode',         mutex: 'N/A',         auto: 'Автоматичен', manual: 'Ръчен'   },
  { feature: 'Cross-process',      mutex: 'Да (именуван)',auto: 'Да (именуван)',manual:'Да (именуван)'},
  { feature: 'Set() метод',        mutex: 'Не',          auto: 'Да',        manual: 'Да'        },
  { feature: 'Освобождаване',      mutex: 'ReleaseMutex()',auto:'Автоматично', manual: 'Reset()'},
  { feature: 'Събужда N thread-а', mutex: 'Точно 1',     auto: 'Точно 1',   manual: 'Всички'   },
  { feature: 'Típica употреба',    mutex: 'Shared resource', auto:'Producer-consumer', manual: 'Init barrier' },
]

export default function CompareTable() {
  const [sortCol, setSortCol] = useState(null)
  const [sortDir, setSortDir] = useState(1)

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d * -1)
    else { setSortCol(col); setSortDir(1) }
  }

  const sorted = sortCol
    ? [...rows].sort((a, b) => a[sortCol].localeCompare(b[sortCol]) * sortDir)
    : rows

  return (
    <div className="ct-wrap">
      <div className="tutorial-card">
        <span className="tutorial-step">⇅</span>
        <div>
          <div className="tutorial-title">Сортирай по примитива, който сравняваш.</div>
          <div className="tutorial-text">Кликни заглавие на колона. Търси три признака: ownership, reset mode и колко thread-а събужда един сигнал.</div>
        </div>
      </div>
      <table className="ct-table">
        <thead>
          <tr>
            <th className="ct-th feature">Характеристика</th>
            {['mutex', 'auto', 'manual'].map(col => (
              <th
                key={col}
                className={`ct-th ${col} ${sortCol === col ? 'sorted' : ''}`}
                onClick={() => handleSort(col)}
              >
                <span className={`ct-th-label ${col}`}>
                  {col === 'mutex' ? '🔒 Mutex' : col === 'auto' ? '🚪 AutoResetEvent' : '🚦 ManualResetEvent'}
                </span>
                <span className="ct-sort-arrow">
                  {sortCol === col ? (sortDir === 1 ? '↑' : '↓') : '⇅'}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={i} className="ct-row">
              <td className="ct-feature">{row.feature}</td>
              <td className="ct-cell mutex">{row.mutex}</td>
              <td className="ct-cell auto">{row.auto}</td>
              <td className="ct-cell manual">{row.manual}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
