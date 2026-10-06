import { Check } from 'lucide-react'
import type { Section } from '@/lib/survey/types'

interface Props {
  path: Section[]
  index: number
}

/** Desktop: a vertical "fiber strand" that fills with light as the respondent advances. */
export function FiberRail({ path, index }: Props) {
  return (
    <nav className="rail" aria-label="Survey progress">
      <ol className="fiber">
        {path.map((section, i) => {
          const state = i < index ? 'done' : i === index ? 'active' : 'todo'
          return (
            <li key={section.id} className={`fiber-item is-${state}`} aria-current={state === 'active' ? 'step' : undefined}>
              <span className="fiber-node" aria-hidden="true">
                {state === 'done' && <Check />}
              </span>
              <span className="fiber-label">
                {section.short}
                <span className="sr-only">{state === 'done' ? ' (completed)' : state === 'active' ? ' (current)' : ''}</span>
              </span>
            </li>
          )
        })}
      </ol>
      <p className="rail-note">Questions adapt to your answers, so this path may get shorter.</p>
    </nav>
  )
}

/** Mobile: a slim bar with the current section name. */
export function MobileProgress({ path, index }: Props) {
  const pct = ((index + 1) / path.length) * 100
  return (
    <div className="m-progress">
      <div className="m-progress-top">
        <span>
          Section {index + 1} of {path.length}
        </span>
        <span className="m-progress-name">{path[index]?.short}</span>
      </div>
      <div
        className="m-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-label="Survey progress"
      >
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}