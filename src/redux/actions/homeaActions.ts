import ActionTypes, { action } from "app-store/action-types"

export const searchAtHome = (payload: { text: string, type: 'events' | 'groups' }): action => {
    return {
        type: ActionTypes.SEARCH_AT_HOME,
        payload
    }
}

export const setSearchedData = (payload: { data: Array<any> | null, type: 'events' | 'groups' }): action => {
    return {
        type: ActionTypes.SET_SEARCHED_DATA,
        payload
    }
}

