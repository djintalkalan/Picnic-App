import ActionTypes, { action } from "app-store/action-types";

export const allGroupsReducer = (state: Array<any> = [], action: action): Array<any> => {
    switch (action.type) {
        case ActionTypes.SET_ALL_GROUPS:
            return action?.payload
        case ActionTypes.ADD_IN_GROUPS:
            return [...state, ...action?.payload]
        default:
            return state
    }
}


