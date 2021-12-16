import ActionTypes, {action} from 'app-store/action-types';

export const isLoadingReducer = (state = false, action: action) => {
  switch (action.type) {
    case ActionTypes.IS_LOADING:
      return action.payload;
    default:
      return state;
  }
};

export const loadingMsgReducer = (state = 'Loading . . .', action: action) => {
  switch (action.type) {
    case ActionTypes.LOADING_MSG:
      return action.payload;
    default:
      return state;
  }
};
