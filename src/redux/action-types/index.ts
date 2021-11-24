import otherTypes from './otherTypes';
import userTypes from './userTypes';

const ActionTypes = {
  ...userTypes,
  ...otherTypes,
}
export interface action {
  type: String,
  payload?: any
}

export default ActionTypes