import { combineReducers } from 'redux';
import { ActionType, getType } from 'typesafe-actions';
import * as user from './User.action';
import { UserUiReducer } from './ui';

// export interface UserStateT {
//   readonly isDemoUser: boolean;
//   readonly isSignedIn: boolean;
//   readonly ui: UserUiStateT;
// }

// export type UserActionT = ActionType<typeof user> & UserUiActionT;

export default combineReducers({
  isDemoUser: (state = false, action: any) => {
    return action.type === getType(user.setDemoUser) ? true : state;
  },
  isSignedIn: (state = false, action: any) => {
    return action.type === getType(user.signInSuccess) ? true : state;
  },
  ui: UserUiReducer
});
