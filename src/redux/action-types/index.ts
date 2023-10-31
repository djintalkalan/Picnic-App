import bitcoinTypes from './bitcoinTypes';
import chatTypes from './chatTypes';
import createEventTypes from './createEventTypes';
import otherTypes from './otherTypes';
import userTypes from './userTypes';

const ActionTypes = {
  ...userTypes,
  ...otherTypes,
  ...chatTypes,
  ...createEventTypes,
  ...bitcoinTypes,
}
export interface action {
  type: String,
  payload?: any
}

export default ActionTypes