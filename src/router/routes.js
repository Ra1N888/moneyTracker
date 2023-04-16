import Dashboard from '../containers/Dashboard';
import Transactions from '../containers/Transactions';
import Accounts from '../containers/Accounts';
import Reports from '../containers/Reports';
import Settings from '../containers/Settings';
import WorkInProgress from '../containers/WorkInProgress';

export default [
  {
    path: '/',
    exact: true,
    label: '仪表盘',
    icon: 'newspaper',
    component: Dashboard
  },
  {
    path: '/transactions/:accountId?',
    link: '/transactions',
    exact: false,
    label: '交易',
    icon: 'exchange',
    component: Transactions
  },
  {
    path: '/accounts',
    exact: false,
    label: '账户',
    icon: 'credit card',
    component: Accounts
  },
  {
    path: '/reports',
    exact: false,
    label: '统计',
    icon: 'line chart',
    component: Reports
  },
  {
    path: '/budget',
    exact: false,
    label: '投资',
    icon: 'shopping basket',
    component: WorkInProgress
  },
  {
    path: '/settings',
    exact: true,
    label: '设置',
    icon: 'options',
    component: Settings
  }
];
