import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import CodeBlock from './CodeBlock.jsx'
import './TheorySlide.css'

gsap.registerPlugin(useGSAP)

function Section({ section }) {
  switch (section.type) {
    case 'text':
      return <p className="theory-text">{section.text}</p>

    case 'list':
      return (
        <ul className="theory-list">
          {section.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )

    case 'code':
      return <CodeBlock code={section.code} />

    case 'callout':
      return (
        <div className="theory-callout">
          <span className="callout-label">{section.label}</span>
          <p>{section.text}</p>
        </div>
      )

    case 'compare-table':
      return (
        <div className="compare-table">
          <div className="compare-col">
            <div className="compare-header">{section.left.label}</div>
            {section.left.rows.map(([k, v], i) => (
              <div key={i} className="compare-row">
                <span className="compare-key">{k}</span>
                <span className="compare-val">{v}</span>
              </div>
            ))}
          </div>
          <div className={`compare-col accented ${section.right.accent}`}>
            <div className="compare-header accented">{section.right.label}</div>
            {section.right.rows.map(([k, v], i) => (
              <div key={i} className="compare-row">
                <span className="compare-key">{k}</span>
                <span className="compare-val">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )

    case 'method-list':
      return (
        <div className="method-list">
          {section.items.map((m, i) => (
            <div key={i} className="method-item">
              <code className="method-name">{m.name}</code>
              <p className="method-desc">{m.desc}</p>
              {m.note && <p className="method-note">{m.note}</p>}
            </div>
          ))}
        </div>
      )

    case 'scenario-list':
      return (
        <div className="scenario-list">
          {section.items.map((s, i) => (
            <div key={i} className="scenario-item">
              <span className="scenario-icon">{s.icon}</span>
              <div>
                <div className="scenario-title">{s.title}</div>
                <div className="scenario-text">{s.text}</div>
              </div>
            </div>
          ))}
        </div>
      )

    case 'highlight-box':
      return (
        <div className={`highlight-box ${section.accent}`}>
          <div className="hb-title">{section.title}</div>
          <p>{section.text}</p>
        </div>
      )

    case 'visual-metaphor':
      return (
        <div className="metaphor-steps">
          {section.items.map((item, i) => (
            <div key={i} className="metaphor-step">
              <div className="metaphor-dot" style={{ background: item.color }} />
              <div>
                <div className="metaphor-state" style={{ color: item.color }}>{item.state}</div>
                <div className="metaphor-desc">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )

    case 'pitfall-list':
      return (
        <div className="pitfall-list">
          {section.items.map((p, i) => (
            <div key={i} className="pitfall-item">
              <div className="pitfall-title">{p.title}</div>
              <p className="pitfall-text">{p.text}</p>
              {p.code && <CodeBlock code={p.code} compact />}
            </div>
          ))}
        </div>
      )

    case 'perf-table':
      return (
        <table className="perf-table">
          <thead>
            <tr>
              <th>Примитива</th>
              <th>Приблизителна цена</th>
              <th>Бележка</th>
            </tr>
          </thead>
          <tbody>
            {section.rows.map((r, i) => (
              <tr key={i}>
                <td><code>{r.primitive}</code></td>
                <td className="perf-cost">{r.cost}</td>
                <td className="perf-note">{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )

    case 'qa-slide':
      return (
        <div className="qa-sources">
          <h3 className="qa-sources-title">Използвани ресурси</h3>
          {section.sources.map((s, i) => (
            <div key={i} className="qa-source">
              <span className="qa-source-dot" />
              {s.url
                ? <a href={s.url} target="_blank" rel="noreferrer">{s.title}</a>
                : <span>{s.title}</span>
              }
            </div>
          ))}
        </div>
      )

    default:
      return null
  }
}

export default function TheorySlide({ slide }) {
  const slideRef = useRef(null)

  useGSAP(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      gsap.set('.theory-kicker, .theory-title, .theory-section', { autoAlpha: 1, y: 0 })
      return
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.from('.theory-kicker', { autoAlpha: 0, y: 12, duration: 0.32 })
      .from('.theory-title', { autoAlpha: 0, y: 24, filter: 'blur(8px)', duration: 0.56 }, '-=0.12')
      .from('.theory-section', {
        autoAlpha: 0,
        y: 26,
        rotationX: -5,
        transformOrigin: '50% 0%',
        stagger: { each: 0.07, from: 'start' },
        duration: 0.5,
        clearProps: 'filter,transform,visibility',
      }, '-=0.22')
  }, { scope: slideRef, dependencies: [slide.id], revertOnUpdate: true })

  return (
    <div className="theory-slide" ref={slideRef}>
      <div className="theory-header">
        <div className="theory-kicker">
          <span className="theory-part">Part {slide.part}</span>
          <span className="theory-rule" />
        </div>
        <h2 className="theory-title">{slide.title}</h2>
      </div>
      <div className="theory-body">
        {slide.sections?.map((s, i) => (
          <div key={i} className="theory-section" style={{ '--si': i }}>
            <Section section={s} />
          </div>
        ))}
      </div>
    </div>
  )
}
