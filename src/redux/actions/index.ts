export * from './authActions';
export * from './eventActions';
export * from './groupActions';
export * from './groupChatActions';
export * from './homeActions';
export * from './otherActions';
export * from './profileActions';

export interface IPaginationState {
    currentPage: number
    totalPages: number
    perPage: number
}

