import { takeLatest, call, put, select } from 'redux-saga/effects';
import union from 'lodash/union';
import {
  startDataImport,
  importFileReadSuccess,
  importLineProcessed,
  importFailure
} from '../actions/ui/dataImport';
import { changeSettingsCurrency } from '../actions/settings';
import { saveAccount } from '../actions/entities/accounts';
import { saveTransaction } from '../actions/entities/transactions';
import { getImportFile } from '../selectors/ui/dataImport';
import { getBaseCurrency, getSecondaryCurrency } from '../selectors/settings';
import { getAccountByName } from '../selectors/entities/accounts';
import { saveAccountSaga } from './accounts';
import { saveTransactionSaga } from './transactions';
import { defaultGroup, formTostate } from '../entities/Account';
import { formToState } from '../entities/Transaction';
import CsvReader from '../util/CsvReader';

export function* startDataImportSaga() {
  try {
    const file = yield select(getImportFile);


    console.log('saga:')
    // console.dir(file)

    const { transactions, accounts, currencies } = yield call(CsvReader, file);

    console.log('saga_transactions: ' + JSON.stringify(transactions))
    console.log('saga_accounts: ' + Array.from(accounts.entries()))
    console.log('saga_currencies: ' + Array.from(currencies))



    console.log('this will be executed');









    yield put(importFileReadSuccess(transactions.length - 1));
    yield updateCurrencySettings(currencies);
    const accountIdByName = yield mapAccountsId(accounts); // Map, 新建不存在的账户
    console.log('acountidbyname: ' + Array.from(accountIdByName.entries()))


    // throw new Error('something went wrong');


    for (const [lineNr, transaction] of transactions.entries()) {


      // console.log('lineNr_:')
      // console.log(lineNr)
      // console.log(Object.prototype.toString.call(lineNr))


      // console.log('transaction_:')
      // console.log(transaction)
      // console.log(Object.prototype.toString.call(transaction))

      // throw new Error('something went wrong');

      yield saveTransactionSaga(
        saveTransaction(
          formToState({
            ...transaction,
            accountId: accountIdByName.get(transaction.account),
            linkedAccountId: accountIdByName.get(transaction.linkedAccount)
          })
        )
      );
      yield put(importLineProcessed(lineNr));
    }




  } catch (error) {


    console.log('kkkkk')
    yield put(importFailure(error));
  }
}

/**
 * Set currencies from import file as secondary.
 *
 * @param {Set} currencies
 */
export function* updateCurrencySettings(currencies) {
  const base = yield select(getBaseCurrency);
  const secondary = yield select(getSecondaryCurrency);

  yield put(
    changeSettingsCurrency({
      base,
      secondary: union(secondary, [...currencies])
    })
  );
}

/**
 * Map account name to account ID.
 * If no account found in local accounts, create new one.
 *
 * @param {Map} accounts name => set of currencies map
 * @return {Map} account name => account id map
 */
export function* mapAccountsId(accounts) { // key-value , 'wexin'-[cny,usd,jap]
  const idByName = new Map();
  for (const [name, currency] of accounts.entries()) {

    console.log('map_name: ' + name)
    console.log('map_currency: ' + currency)
    let account = yield select(getAccountByName(name));
    if (!account) account = yield createNewAccount(name, [...currency]);

    idByName.set(name, account.id);
  }

  return idByName;
}

/**
 * Create new account.
 *
 * @param {string} name
 * @param {array} currencies list of used currencies
 * @return {object}
 */
export function* createNewAccount(name, currencies) {
  const account = formTostate({
    name,
    group: defaultGroup,
    balance: currencies.reduce((acc, code) => {
      acc[code] = 0;
      return acc;
    }, {}),
    currencies,
    on_dashboard: true
  });
  yield saveAccountSaga(saveAccount(account));

  return account;
}

export default [takeLatest(startDataImport, startDataImportSaga)];
