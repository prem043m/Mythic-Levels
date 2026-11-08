import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useGameStore } from '@/store/useGameStore'
import { createInitialState } from '@/services/progression/engine'
import { ROUTES } from '@/config/routes'
import Journey from '@/pages/Journey'
import Realm from '@/pages/Realm'
import Gate from '@/pages/Gate'

function renderAt(path, element, routePath = path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={routePath} element={element} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  useGameStore.setState({ game: createInitialState({ name: 'Routing test' }) })
})

describe('journey routing foundation', () => {
  it('renders the World Tree route with all three Arcana destinations', () => {
    renderAt(ROUTES.journey, <Journey />)
    expect(screen.getByRole('heading', { name: 'The World Tree' })).toBeInTheDocument()
    const realmLinks = screen.getAllByRole('link', { name: 'Enter realm' })
    expect(realmLinks).toHaveLength(3)
    expect(realmLinks[0]).toHaveAttribute('href', '/journey/beast')
  })

  it.each([
    ['beast', 'The Beast'],
    ['human', 'The Human'],
    ['sage', 'The Sage'],
  ])('renders the %s Realm route from canonical Arcana data', (id, name) => {
    renderAt(ROUTES.realm(id), <Realm />, '/journey/:arcanaId')
    expect(screen.getByRole('heading', { name: new RegExp(name), level: 1 })).toBeInTheDocument()
    expect(screen.getByText('The Gates of ' + name)).toBeInTheDocument()
  })

  it('rejects an invalid Arcana route instead of rendering a realm', () => {
    render(
      <MemoryRouter initialEntries={['/journey/unknown']}>
        <Routes>
          <Route path="/journey/:arcanaId" element={<Realm />} />
          <Route path="/journey" element={<p>World Tree fallback</p>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('World Tree fallback')).toBeInTheDocument()
  })

  it('links unlocked Gates by canonical Gate ID and leaves locked Gates inert', () => {
    renderAt(ROUTES.realm('beast'), <Realm />, '/journey/:arcanaId')
    expect(screen.getByRole('link', { name: /Gate 1.*The Gremlin/ })).toHaveAttribute('href', '/gate/beast-01')
    expect(screen.queryByRole('link', { name: /Gate 2/ })).not.toBeInTheDocument()
  })

  it.each([
    ['/arcanas', '/journey'],
    ['/plan', '/quests'],
  ])('keeps legacy route %s compatible through redirect', (legacy, destination) => {
    render(
      <MemoryRouter initialEntries={[legacy]}>
        <Routes>
          <Route path="/arcanas" element={<Navigate to={destination} replace />} />
          <Route path="/plan" element={<Navigate to={destination} replace />} />
          <Route path={destination} element={<p>{destination}</p>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText(destination)).toBeInTheDocument()
  })

  it('does not render an invalid Gate and returns to the World Tree', () => {
    render(
      <MemoryRouter initialEntries={['/gate/not-a-gate']}>
        <Routes>
          <Route path="/gate/:gateId" element={<Gate />} />
          <Route path="/journey" element={<p>World Tree fallback</p>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('World Tree fallback')).toBeInTheDocument()
  })

  it('keeps locked Gate access inside the progression boundary', () => {
    render(
      <MemoryRouter initialEntries={['/gate/beast-02']}>
        <Routes><Route path="/gate/:gateId" element={<Gate />} /></Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('This Gate is locked. Complete the previous Gate first.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to the World Tree' })).toHaveAttribute('href', '/journey')
  })
})
