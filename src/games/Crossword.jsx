import { useState, useEffect, useRef, useCallback } from 'react'
import { CheckCircle } from '@phosphor-icons/react'
import './Crossword.css'

const ROWS = 7
const COLS = 6

// null = black cell
const SOLUTION = [
  ['M', 'U', 'T', 'E', 'X', null],
  ['A', null, 'H', null, null, null],
  ['N', null, 'R', 'A', 'C', 'E'],
  ['U', null, 'E', 'U', null, 'V'],
  ['A', null, 'A', 'T', null, 'E'],
  ['L', null, 'D', 'O', null, 'N'],
  [null, null, null, null, null, 'T'],
]

const WORDS = [
  {
    id: '1A', number: 1, dir: 'across', row: 0, col: 0, len: 5,
    clue: 'Примитива с thread affinity; само притежателят освобождава',
  },
  {
    id: '1D', number: 1, dir: 'down', row: 0, col: 0, len: 6,
    clue: '___ResetEvent: Set() отваря портата за всички чакащи нишки едновременно',
  },
  {
    id: '2D', number: 2, dir: 'down', row: 0, col: 2, len: 6,
    clue: 'Основната единица на паралелизъм в .NET',
  },
  {
    id: '3A', number: 3, dir: 'across', row: 2, col: 2, len: 4,
    clue: '___ condition: две нишки четат и пишат едновременно без синхронизация',
  },
  {
    id: '4D', number: 4, dir: 'down', row: 2, col: 3, len: 4,
    clue: '___ResetEvent: автоматично се затваря след всяко Set()',
  },
  {
    id: '5D', number: 5, dir: 'down', row: 2, col: 5, len: 5,
    clue: 'Wait___Handle: базов клас за AutoReset и ManualReset',
  },
]

// Build a lookup: (row, col) → word number (for rendering cell numbers)
const CELL_NUMBERS = {}
WORDS.forEach(w => {
  const key = `${w.row},${w.col}`
  if (!CELL_NUMBERS[key]) CELL_NUMBERS[key] = w.number
})

function cellsInWord(word) {
  return Array.from({ length: word.len }, (_, i) => ({
    row: word.dir === 'down'   ? word.row + i : word.row,
    col: word.dir === 'across' ? word.col + i : word.col,
  }))
}

function getWordForCell(row, col, dir) {
  return WORDS.find(w => {
    if (w.dir !== dir) return false
    return cellsInWord(w).some(c => c.row === row && c.col === col)
  })
}

function initCells() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(''))
}

function checkAll(cells) {
  return SOLUTION.every((row, ri) =>
    row.every((letter, ci) =>
      letter === null || cells[ri][ci].toUpperCase() === letter
    )
  )
}

export default function Crossword() {
  const [cells, setCells] = useState(initCells)
  const [cursor, setCursor] = useState({ row: 0, col: 0, dir: 'across' })
  const [done, setDone] = useState(false)
  const [checked, setChecked] = useState(false)
  const gridRef = useRef(null)

  const activeWord = getWordForCell(cursor.row, cursor.col, cursor.dir)

  const isInActiveWord = useCallback((row, col) => {
    if (!activeWord) return false
    return cellsInWord(activeWord).some(c => c.row === row && c.col === col)
  }, [activeWord])

  const moveCursor = useCallback((row, col, dir) => {
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return
    if (SOLUTION[row][col] === null) return
    setCursor({ row, col, dir })
  }, [])

  const advance = useCallback((row, col, dir) => {
    let r = row + (dir === 'down' ? 1 : 0)
    let c = col + (dir === 'across' ? 1 : 0)
    while (r < ROWS && c < COLS) {
      if (SOLUTION[r][c] !== null) { setCursor({ row: r, col: c, dir }); return }
      r += dir === 'down' ? 1 : 0
      c += dir === 'across' ? 1 : 0
    }
  }, [])

  const retreat = useCallback((row, col, dir) => {
    let r = row - (dir === 'down' ? 1 : 0)
    let c = col - (dir === 'across' ? 1 : 0)
    while (r >= 0 && c >= 0) {
      if (SOLUTION[r][c] !== null) { setCursor({ row: r, col: c, dir }); return }
      r -= dir === 'down' ? 1 : 0
      c -= dir === 'across' ? 1 : 0
    }
  }, [])

  const handleKeyDown = useCallback((e) => {
    if (done) return
    const { row, col, dir } = cursor
    const key = e.key

    if (key.length === 1 && key.match(/[a-zA-Z]/)) {
      e.preventDefault()
      e.stopPropagation()
      const letter = key.toUpperCase()
      setCells(prev => {
        const next = prev.map(r => [...r])
        next[row][col] = letter
        if (checkAll(next)) setDone(true)
        return next
      })
      setChecked(false)
      advance(row, col, dir)
      return
    }

    if (key === 'Backspace') {
      e.preventDefault()
      e.stopPropagation()
      if (cells[row][col]) {
        setCells(prev => { const n = prev.map(r=>[...r]); n[row][col]=''; return n })
        setChecked(false)
      } else {
        retreat(row, col, dir)
      }
      return
    }

    if (key === 'Tab') {
      e.preventDefault()
      e.stopPropagation()
      const idx = WORDS.findIndex(w => w.id === activeWord?.id)
      const next = WORDS[(idx + 1) % WORDS.length]
      setCursor({ row: next.row, col: next.col, dir: next.dir })
      return
    }

    // Arrow navigation
    const arrows = {
      ArrowRight: [0,  1,  'across'],
      ArrowLeft:  [0, -1,  'across'],
      ArrowDown:  [1,  0,  'down'],
      ArrowUp:    [-1, 0,  'down'],
    }
    if (arrows[key]) {
      e.preventDefault()
      e.stopPropagation()
      const [dr, dc, newDir] = arrows[key]
      let r = row + dr, c = col + dc
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        if (SOLUTION[r][c] !== null) { moveCursor(r, c, newDir); return }
        r += dr; c += dc
      }
    }
  }, [cursor, cells, done, advance, retreat, moveCursor, activeWord])

  const handleCellClick = (row, col) => {
    if (SOLUTION[row][col] === null) return
    gridRef.current?.focus()
    if (cursor.row === row && cursor.col === col) {
      // Toggle direction if both are available
      const canAcross = !!getWordForCell(row, col, 'across')
      const canDown   = !!getWordForCell(row, col, 'down')
      if (canAcross && canDown) {
        setCursor(c => ({ ...c, dir: c.dir === 'across' ? 'down' : 'across' }))
      }
    } else {
      const canAcross = !!getWordForCell(row, col, 'across')
      setCursor({ row, col, dir: canAcross ? 'across' : 'down' })
    }
  }

  const handleClueClick = (word) => {
    gridRef.current?.focus()
    setCursor({ row: word.row, col: word.col, dir: word.dir })
  }

  const reset = () => {
    setCells(initCells())
    setCursor({ row: 0, col: 0, dir: 'across' })
    setDone(false)
    setChecked(false)
    setTimeout(() => gridRef.current?.focus(), 0)
  }

  const checkAnswers = () => setChecked(true)

  const cellState = (row, col) => {
    const letter = SOLUTION[row][col]
    if (!checked || !cells[row][col]) return ''
    return cells[row][col].toUpperCase() === letter ? 'cw-ok' : 'cw-err'
  }

  // Group words for the clue panel
  const across = WORDS.filter(w => w.dir === 'across')
  const down   = WORDS.filter(w => w.dir === 'down')

  return (
    <div className="cw-wrap">
      <div className="cw-left">
        <div
          className="cw-grid"
          ref={gridRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
        >
          {SOLUTION.map((row, ri) =>
            row.map((letter, ci) => {
              if (letter === null) {
                return <div key={`${ri}-${ci}`} className="cw-black" />
              }
              const num = CELL_NUMBERS[`${ri},${ci}`]
              const isCursor  = cursor.row === ri && cursor.col === ci
              const isWordHighlight = isInActiveWord(ri, ci)
              const val = cells[ri][ci]
              return (
                <div
                  key={`${ri}-${ci}`}
                  className={`cw-cell ${isCursor ? 'cw-cursor' : ''} ${isWordHighlight && !isCursor ? 'cw-word' : ''} ${cellState(ri, ci)}`}
                  onClick={() => handleCellClick(ri, ci)}
                >
                  {num && <span className="cw-num">{num}</span>}
                  <span className="cw-letter">{val}</span>
                </div>
              )
            })
          )}
        </div>

        <div className="cw-actions">
          <button className="cw-btn cw-btn-check" onClick={checkAnswers} disabled={done}>
            Провери
          </button>
          <button className="cw-btn cw-btn-reset" onClick={reset}>
            Изчисти
          </button>
          <span className="cw-hint-text">Tab — следваща дума</span>
        </div>

        {done && (
          <div className="cw-done">
            <CheckCircle size={20} weight="duotone" className="cw-done-icon" />
            Всички думи правилни!
          </div>
        )}
      </div>

      <div className="cw-clues">
        <div className="cw-clue-group">
          <div className="cw-clue-heading">Хоризонтално</div>
          {across.map(w => (
            <div
              key={w.id}
              className={`cw-clue ${activeWord?.id === w.id ? 'cw-clue-active' : ''}`}
              onClick={() => handleClueClick(w)}
            >
              <span className="cw-clue-num">{w.number}</span>
              <span className="cw-clue-text">{w.clue}</span>
            </div>
          ))}
        </div>
        <div className="cw-clue-group">
          <div className="cw-clue-heading">Вертикално</div>
          {down.map(w => (
            <div
              key={w.id}
              className={`cw-clue ${activeWord?.id === w.id ? 'cw-clue-active' : ''}`}
              onClick={() => handleClueClick(w)}
            >
              <span className="cw-clue-num">{w.number}</span>
              <span className="cw-clue-text">{w.clue}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
