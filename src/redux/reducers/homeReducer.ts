import ActionTypes, { action } from "app-store/action-types";

export interface IHomeReducer {
    searchedEvents: Array<any> | null,
    searchedGroups: Array<any> | null,
}

const initialHomeData = {
    searchedEvents: null,
    searchedGroups: null,
}

export const homeReducer = (state: IHomeReducer = initialHomeData, action: action): IHomeReducer => {
    const key = action?.payload?.type == 'events' ? 'searchedEvents' : 'searchedGroups'
    switch (action?.type) {
        case ActionTypes.SET_SEARCHED_DATA:
            if (!action?.payload?.data && !state[key]) {
                return state
            }
            return { searchedGroups: null, searchedEvents: null, [key]: action?.payload?.data }
        default:
            return state
    }

}