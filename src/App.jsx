import { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { slides } from './data/slideData.jsx'
import Navigation from './components/Navigation.jsx'
import Progress from './components/Progress.jsx'
import SpeakerNotes from './components/SpeakerNotes.jsx'
import TableOfContents from './components/TableOfContents.jsx'
import LessonPlan from './components/LessonPlan.jsx'
import StudyPlan from './components/StudyPlan.jsx'
import KeyboardHelp from './components/KeyboardHelp.jsx'
import SlideRenderer from './components/SlideRenderer.jsx'
import './App.css'

const slideVariants = {
  initial: (d) => ({
    opacity: 0,
    x: d > 0 ? 80 : -80,
    filter: 'blur(6px)',
    scale: 0.97,
  }),
  animate: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    scale: 1,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (d) => ({
    opacity: 0,
    x: d > 0 ? -80 : 80,
    filter: 'blur(6px)',
    scale: 0.97,
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function App() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const [showNotes, setShowNotes] = useState(false)
  const [showTOC, setShowTOC] = useState(false)
  const [showPlan, setShowPlan] = useState(false)
  const [showStudyPlan, setShowStudyPlan] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const prevRef = useRef(current)
  const firstRenderRef = useRef(true)

  const goTo = useCallback((index) => {
    if (index < 0 || index >= slides.length) return
    setDirection(index >= prevRef.current ? 1 : -1)
    prevRef.current = index
    setCurrent(index)
  }, [])

  const next = useCallback(() => goTo(current + 1), [current, goTo])
  const prev = useCallback(() => goTo(current - 1), [current, goTo])

  const nextGame = useCallback(() => {
    const idx = slides.findIndex((s, i) => i > current && (s.type === 'game' || s.type === 'quiz' || s.type === 'codegame'))
    if (idx !== -1) goTo(idx)
  }, [current, goTo])

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      const anyOverlay = showTOC || showNotes || showPlan || showStudyPlan || showHelp
      if (anyOverlay) {
        if (e.key === 'Escape') {
          setShowTOC(false)
          setShowNotes(false)
          setShowPlan(false)
          setShowStudyPlan(false)
          setShowHelp(false)
        }
        return
      }

      switch (e.key) {
        case 'ArrowRight': case 'ArrowDown': case ' ':
          e.preventDefault(); next(); break
        case 'ArrowLeft': case 'ArrowUp':
          e.preventDefault(); prev(); break
        case 'g': case 'G':
          nextGame(); break
        case 's': case 'S':
          setShowNotes(v => !v); break
        case 'l': case 'L':
          setShowPlan(v => !v); break
        case 'p': case 'P':
          setShowStudyPlan(v => !v); break
        case 'f': case 'F':
          if (!document.fullscreenElement) document.documentElement.requestFullscreen?.()
          else document.exitFullscreen?.()
          break
        case '?':
          setShowHelp(v => !v); break
        case 'Escape':
          setShowTOC(true); break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [next, prev, nextGame, showTOC, showNotes, showPlan, showStudyPlan, showHelp])

  return (
    <div className="app-shell">
      <Progress slides={slides} current={current} goTo={goTo} />

      <main className="stage">
        <AnimatePresence mode="sync" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial={firstRenderRef.current ? false : 'initial'}
            animate="animate"
            exit="exit"
            onAnimationStart={() => { firstRenderRef.current = false }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <SlideRenderer slide={slides[current]} />
          </motion.div>
        </AnimatePresence>
      </main>

      <Navigation
        current={current}
        total={slides.length}
        onPrev={prev}
        onNext={next}
        onTOC={() => setShowTOC(true)}
        onPlan={() => setShowPlan(v => !v)}
        onHelp={() => setShowHelp(v => !v)}
        planActive={showPlan}
      />

      <AnimatePresence>
        {showNotes && (
          <SpeakerNotes notes={slides[current].speakerNotes} onClose={() => setShowNotes(false)} />
        )}
        {showTOC && (
          <TableOfContents
            slides={slides} current={current}
            goTo={(i) => { goTo(i); setShowTOC(false) }}
            onClose={() => setShowTOC(false)}
          />
        )}
        {showPlan && (
          <LessonPlan current={current} goTo={(i) => { goTo(i); setShowPlan(false) }} onClose={() => setShowPlan(false)} />
        )}
        {showStudyPlan && (
          <StudyPlan slide={slides[current]} onClose={() => setShowStudyPlan(false)} />
        )}
        {showHelp && (
          <KeyboardHelp onClose={() => setShowHelp(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
