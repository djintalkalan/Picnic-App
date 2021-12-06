export * from './authActions';
export * from './groupActions';
export * from './otherActions';

export interface IPaginationState {
    currentPage: number
    totalPages: number
    perPage: number
}

