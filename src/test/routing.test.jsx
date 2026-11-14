import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useGameStore } from '@/store/useGameStore'
import { createInitialState } from '@/services/progression/engine'
import { createGateProgress } from '@/domain/models'
import { ROUTES } from '@/config/routes'
import { listGates } from '@/data/catalog'
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
    const realmLinks = screen.getAllByRole('link', { name: /Enter The/ })
    expect(realmLinks).toHaveLength(3)
    expect(realmLinks[0]).toHaveAttribute('href', '/journey/beast')
  })

  it('represents all 27 canonical Gates across the three Arcana branches', () => {
    renderAt(ROUTES.journey, <Journey />)
    expect(screen.getAllByRole('listitem')).toHaveLength(listGates().length)
    expect(screen.getByRole('heading', { name: 'The Beast' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'The Human' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'The Sage' })).toBeInTheDocument()
  })

  it('marks the first Gate active and keeps later locked Gates inert', () => {
    renderAt(ROUTES.journey, <Journey />)
    expect(screen.getByRole('link', { name: /The Gremlin of Flickering Thoughts, Gate 1, Current Gate/ })).toHaveAttribute('href', '/gate/beast-01')
    const lockedGate = screen.getByTitle('The Troll of Deafened Ears is locked until the previous Gate is complete.')
    expect(lockedGate).toHaveAttribute('aria-disabled', 'true')
    expect(screen.queryByRole('link', { name: /The Troll of Deafened Ears, Gate 2/ })).not.toBeInTheDocument()
  })

  it('renders the Beast Realm with all nine canonical Gate destinations', () => {
    renderAt(ROUTES.realm('beast'), <Realm />, '/journey/:arcanaId')
    expect(screen.getByRole('heading', { name: 'Beast Arcana' })).toBeInTheDocument()
    expect(screen.getByText('The Beast Gates')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(9)
    expect(screen.getByRole('link', { name: /The Gremlin of Flickering Thoughts, Gate 1/ })).toHaveAttribute('href', '/gate/beast-01')
    expect(screen.queryByRole('link', { name: /The Troll of Deafened Ears, Gate 2/ })).not.toBeInTheDocument()
  })

  it.each([
    ['human', 'The Human'],
    ['sage', 'The Sage'],
  ])('renders the %s Realm route from canonical Arcana data', (id) => {
    renderAt(ROUTES.realm(id), <Realm />, '/journey/:arcanaId')
    expect(screen.getByRole('heading', { name: id === 'human' ? 'Human Arcana' : 'Sage Arcana', level: 1 })).toBeInTheDocument()
    expect(screen.getByText(id === 'human' ? 'The Human Gates' : 'The Sage Gates')).toBeInTheDocument()
  })

  it('renders the Human Realm with all nine canonical Gate destinations and emblems', () => {
    renderAt(ROUTES.realm('human'), <Realm />, '/journey/:arcanaId')
    expect(screen.getByRole('heading', { name: 'Human Arcana' })).toBeInTheDocument()
    expect(screen.getByText('The Human Gates')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(9)
    expect(screen.queryByRole('link', { name: /The Lantern of Awareness, Gate 1/ })).not.toBeInTheDocument()
    expect(screen.getByTitle('The Lantern of Awareness is locked until the previous Gate is complete.')).toBeInTheDocument()
  })

  it.each([
    ['beast', 'beast-gate-path'],
    ['human', 'human-gate-court'],
    ['sage', 'sage-gate-constellation'],
  ])('uses the standardized three-column Gate grid for the %s Realm', (id, gridClass) => {
    const { container } = renderAt(ROUTES.realm(id), <Realm />, '/journey/:arcanaId')
    const grid = container.querySelector(`.${gridClass}`)
    expect(grid).toBeInTheDocument()
    expect(grid.children).toHaveLength(9)
    expect(grid).toHaveClass('gate-grid-standard')
  })

  it('identifies the current Human Gate and supports World Tree navigation', () => {
    const game = createInitialState({ name: 'Human seeker' })
    game.progress.gates['human-01'] = { ...createGateProgress('human-01') }
    game.player.currentArcana = 'human'
    game.player.currentGate = 1
    useGameStore.setState({ game })
    renderAt(ROUTES.realm('human'), <Realm />, '/journey/:arcanaId')
    expect(screen.getByRole('heading', { name: 'The Lantern of Awareness', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Continue the practice/ })).toHaveAttribute('href', '/gate/human-01')
    expect(screen.getByRole('link', { name: /Return to the World Tree/ })).toHaveAttribute('href', '/journey')
  })

  it('shows the completed Human state when all Human Gates are complete', () => {
    const game = createInitialState({ name: 'Completed Human' })
    for (let gateNumber = 1; gateNumber <= 9; gateNumber += 1) {
      const gateId = `human-${String(gateNumber).padStart(2, '0')}`
      game.progress.gates[gateId] = { ...createGateProgress(gateId), completedAt: new Date().toISOString() }
    }
    game.player.currentArcana = 'sage'
    game.player.currentGate = 1
    useGameStore.setState({ game })
    renderAt(ROUTES.realm('human'), <Realm />, '/journey/:arcanaId')
    expect(screen.getByRole('heading', { name: 'The Human Arcana is complete' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Continue the practice/ })).not.toBeInTheDocument()
  })

  it('renders the Sage Realm with all nine canonical Gate destinations and emblems', () => {
    renderAt(ROUTES.realm('sage'), <Realm />, '/journey/:arcanaId')
    expect(screen.getByRole('heading', { name: 'Sage Arcana' })).toBeInTheDocument()
    expect(screen.getByText('The Sage Gates')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(9)
    expect(screen.queryByRole('link', { name: /The Veil of Inner Sight, Gate 1/ })).not.toBeInTheDocument()
    expect(screen.getByTitle('The Veil of Inner Sight is locked until the previous Gate is complete.')).toBeInTheDocument()
  })

  it('identifies the current Sage Gate and supports World Tree navigation', () => {
    const game = createInitialState({ name: 'Sage seeker' })
    game.progress.gates['sage-01'] = { ...createGateProgress('sage-01') }
    game.player.currentArcana = 'sage'
    game.player.currentGate = 1
    useGameStore.setState({ game })
    renderAt(ROUTES.realm('sage'), <Realm />, '/journey/:arcanaId')
    expect(screen.getByRole('heading', { name: 'The Veil of Inner Sight', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Continue the ascent/ })).toHaveAttribute('href', '/gate/sage-01')
    expect(screen.getByRole('link', { name: /Return to the World Tree/ })).toHaveAttribute('href', '/journey')
  })

  it('shows the completed Sage state when all Sage Gates are complete', () => {
    const game = createInitialState({ name: 'Completed Sage' })
    for (let gateNumber = 1; gateNumber <= 9; gateNumber += 1) {
      const gateId = `sage-${String(gateNumber).padStart(2, '0')}`
      game.progress.gates[gateId] = { ...createGateProgress(gateId), completedAt: new Date().toISOString() }
    }
    game.player.currentArcana = 'sage'
    game.player.currentGate = 1
    useGameStore.setState({ game })
    renderAt(ROUTES.realm('sage'), <Realm />, '/journey/:arcanaId')
    expect(screen.getByRole('heading', { name: 'The Sage Arcana is complete' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Continue the ascent/ })).not.toBeInTheDocument()
  })

  it('identifies the current Beast Gate and supports World Tree navigation', () => {
    renderAt(ROUTES.realm('beast'), <Realm />, '/journey/:arcanaId')
    expect(screen.getByRole('heading', { name: 'The Gremlin of Flickering Thoughts', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Continue the hunt/ })).toHaveAttribute('href', '/gate/beast-01')
    expect(screen.getByRole('link', { name: /Return to the World Tree/ })).toHaveAttribute('href', '/journey')
  })

  it('keeps the canonical Gate emblem alongside the mastery ring in the Gate Chamber', () => {
    renderAt(ROUTES.gate('beast-01'), <Gate />, '/gate/:gateId')
    expect(screen.getByRole('img', { name: 'The Gremlin of Flickering Thoughts emblem' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Mastery 0 percent' })).toBeInTheDocument()
  })

  it('shows the completed Beast state when all Beast Gates are complete', () => {
    const game = createInitialState({ name: 'Completed Beast' })
    for (let gateNumber = 1; gateNumber <= 9; gateNumber += 1) {
      const gateId = `beast-${String(gateNumber).padStart(2, '0')}`
      game.progress.gates[gateId] = { ...createGateProgress(gateId), completedAt: new Date().toISOString() }
    }
    game.player.currentArcana = 'human'
    game.player.currentGate = 1
    useGameStore.setState({ game })
    renderAt(ROUTES.realm('beast'), <Realm />, '/journey/:arcanaId')
    expect(screen.getByRole('heading', { name: 'The Beast Arcana is complete' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Continue the hunt/ })).not.toBeInTheDocument()
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
    expect(screen.getByRole('link', { name: /The Gremlin of Flickering Thoughts, Gate 1/ })).toHaveAttribute('href', '/gate/beast-01')
    expect(screen.queryByRole('link', { name: /The Troll of Deafened Ears, Gate 2/ })).not.toBeInTheDocument()
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
