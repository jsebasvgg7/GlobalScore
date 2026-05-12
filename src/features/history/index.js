// Componentes desktop
export { default as HistoricalCompetitionsPage } from './components/HistoricalCompetitionsPage'
export { default as HistoricalEventsPage } from './components/HistoricalEventsPage'
export { default as HistoricalTeamsPage } from './components/HistoricalTeamsPage'
export { default as HistoryMenuDesktop } from './components/HistoryMenuDesktop'
export { default as HistoryRightPanel } from './components/HistoryRightPanel'
export { default as HistorySectionNav } from './components/HistorySectionNav'
export { default as HistoryWelcomeScreen } from './components/HistoryWelcomeScreen'
export { default as KnockoutBracketMobile } from './components/KnockoutBracketMobile'
export { default as EventsRightPanel } from './components/EventsRightPanel'
export { default as TeamsRightPanel } from './components/TeamsRightPanel'

// Componentes mobile
export { default as HistoricalCompetitionsMobile } from './components/mobile/HistoricalCompetitionsMobile'
export { default as HistoricalEventsMobile } from './components/mobile/HistoricalEventsMobile'
export { default as HistoricalTeamsMobile } from './components/mobile/HistoricalTeamsMobile'
export { default as HistoryMenuMobile } from './components/mobile/HistoryMenuMobile'

// Hooks
export * from './hooks/useHistoricalCompetitions'
export * from './hooks/useHistoricalEvents'
export * from './hooks/useHistoricalPlayers'
export * from './hooks/useHistoricalTeams'

// Servicio
export * from './services/history.service'