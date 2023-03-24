import createSagaMiddleware from 'redux-saga';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction';
import rootReducer from '../reducers';
import rootSaga from '../sagas';

const sagaMiddleware = createSagaMiddleware(); //create the saga middleware
const enhancer = composeWithDevTools(applyMiddleware(sagaMiddleware));

// root.js 里面的 const store = configureStore() 没有pass initialState, 所以用的是 splited reducer 里面的 initialState

export default function configureStore(initialState) {
  const store = createStore(rootReducer, initialState, enhancer); // mount saga on the Store
  sagaMiddleware.run(rootSaga); // then run the saga

  // Hot reloading config
  if (module.hot) {
    module.hot.accept('../reducers', () =>
      // store.replaceReducer(require('../reducers').default)
      store.replaceReducer(rootReducer)
    );
  }

  return store;
}
