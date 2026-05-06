import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import './TitleSlide.css'

const ORB_COUNT = 14
gsap.registerPlugin(useGSAP)

export default function TitleSlide({ slide }) {
  const slideRef = useRef(null)

  useGSAP(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      gsap.set('.title-eyebrow, .title-heading, .title-sub, .title-hierarchy, .title-authors', { autoAlpha: 1 })
      return
    }

    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.title-grid', { autoAlpha: 0, scale: 1.08, duration: 0.65 })
      .from('.title-eyebrow', { x: -18, duration: 0.34 }, '-=0.36')
      .from('.title-heading', { y: 24, scale: 0.98, duration: 0.7 }, '-=0.1')
      .from('.title-sub', { y: 12, duration: 0.36 }, '-=0.28')
      .from('.title-hierarchy', { y: 18, scale: 0.98, duration: 0.48 }, '-=0.08')
      .from('.title-authors', { y: 10, duration: 0.3 }, '-=0.1')
      .from('.th-node:not(.th-ghost)', { y: 8, stagger: 0.045, duration: 0.28 }, '-=0.58')
  }, { scope: slideRef })

  return (
    <div className="title-slide" ref={slideRef}>
      <div className="title-bg" aria-hidden="true">
        {Array.from({ length: ORB_COUNT }).map((_, i) => (
          <div key={i} className="title-orb" style={{ '--i': i }} />
        ))}
        <div className="title-scanline" />
        <div className="title-grid" />
      </div>

      <div className="title-content">
        <div className="title-eyebrow">
          <span className="title-badge-dot" />
          <span className="title-badge-text">11д клас · ПМГ „Константин Величков"</span>
        </div>

        <h1 className="title-heading">
          {slide.title}
        </h1>

        <p className="title-sub">{slide.subtitle}</p>

        <div className="title-hierarchy">
          <div className="th-node th-root">WaitHandle</div>
          <svg className="th-svg" viewBox="0 0 400 60" preserveAspectRatio="none">
            <line x1="200" y1="0" x2="80"  y2="50" className="th-line" style={{ '--d': '0.05s' }} />
            <line x1="200" y1="0" x2="200" y2="50" className="th-line" style={{ '--d': '0.1s' }} />
            <line x1="200" y1="0" x2="320" y2="50" className="th-line" style={{ '--d': '0.15s' }} />
          </svg>
          <div className="th-row">
            <div className="th-node th-mutex">Mutex</div>
            <div className="th-node th-ewh">EventWaitHandle</div>
            <div className="th-node th-ewh th-ghost">·</div>
          </div>
          <svg className="th-svg th-svg-small" viewBox="0 0 400 40" preserveAspectRatio="none">
            <line x1="200" y1="0" x2="140" y2="40" className="th-line" style={{ '--d': '0.25s' }} />
            <line x1="200" y1="0" x2="260" y2="40" className="th-line" style={{ '--d': '0.3s' }} />
          </svg>
          <div className="th-row th-row-leaf">
            <div className="th-node th-auto">AutoResetEvent</div>
            <div className="th-node th-manual">ManualResetEvent</div>
          </div>
        </div>

        <div className="title-authors">
          {slide.authors.map(a => (
            <span key={a} className="title-author">{a}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
