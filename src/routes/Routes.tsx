export type RootParams = {
    Events: { id: string }
    UpcomingPastEvents: { id: string, type: 'upcoming' | 'past' }
}