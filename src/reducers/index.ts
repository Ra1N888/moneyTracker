import { combineReducers } from 'redux';
import entities from './entities';
import ui from './ui';
import settings from './settings';
import stocks from '../features/stocks/stocksSlice'
import user from 'features/user/state/User.reducer';


// export interface RootStateT {
//   user: UserStateT;
// }

export default combineReducers({
  settings,
  entities,
  user,
  ui,
  stocks,
});

