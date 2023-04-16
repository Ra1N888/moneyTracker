import { createBrowserHistory } from 'history';
import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/browser';
import 'semantic-ui-css/semantic.min.css';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import configureStore from './store/configureStore';
import { Provider } from 'react-redux';
import App from './containers/App';
import ErrorBoundary from 'components/Sentry/ErrorBoundary';

// Sentry sdk is error monitoring software
Sentry.init({
  dsn: 'https://5ae855d4c1d840c1b06679123069574f@sentry.io/1335198'
});

const store = configureStore();
const history = createBrowserHistory();

// ReactDOM.render(
//   <Root store={store} history={history} />,
//   document.getElementById('root')
// );


ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <Provider store={store}>
      <App history={history} />
    </Provider>
  </ErrorBoundary>
);

registerServiceWorker(); // you can ignore this file's function

// if (module.hot) {
//   module.hot.accept()
// }
