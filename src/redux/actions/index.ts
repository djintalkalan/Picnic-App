export * from './authActions';
export * from './groupActions';
export * from './otherActions';
export * from './profileActions';
export * from './eventActions';

export interface IPaginationState {
    currentPage: number
    totalPages: number
    perPage: number
}

