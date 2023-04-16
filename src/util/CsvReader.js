import { TransationKindT } from '../entities/Transaction';

const { Expense, Transfer, Income } = TransationKindT;


let transactions = [];
let accounts = new Map();
let currencies = new Set();

const SEPARATOR = ',';
const COLUMN = {
  DATE: 0,
  ACCOUNT: 1,
  TAGS: 2,
  AMOUNT: 3,
  CURRENCY: 4,
  NOTE: 5,
  TRANSFER: 6
};

export default file => {

  transactions = [];
  accounts = new Map();
  currencies = new Set();


  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = event => {
      try {
        resolve(convert(event.target.result.split('\n')));
      } catch (error) {
        reject(error);
      }
    };

    reader.readAsText(file);
  });
}

function convert(rows) {
  const header = rows[0].split(SEPARATOR);
  console.log('reader header: ' + header)
  if (header.length !== Object.keys(COLUMN).length) {

    console.log('headerlength: ' + header.length)
    console.log('needlength: ' + Object.keys(COLUMN).length)

    throw new Error(`Invalid file format!
    Must be a CSV with following columns:
    date;account;tags;amount;currency;description;transfer`);
  }

  for (let line = 1; line < rows.length; line++) {
    const row = rows[line].split(SEPARATOR);
    if (row.length !== Object.keys(COLUMN).length) continue;

    const transaction = {
      kind: getKind(row),
      account: getAccount(row),
      amount: Math.abs(getAmount(row)),
      currency: row[COLUMN.CURRENCY],
      date: getDate(row),
      tags: getTags(row),
      note: row[COLUMN.NOTE]
    };

    if (transaction.kind === Transfer) {
      const nextRow = rows[++line].split(SEPARATOR);
      transaction.linkedAccount = getAccount(nextRow);
      transaction.linkedAmount = getAmount(nextRow);
      transaction.linkedCurrency = nextRow[COLUMN.CURRENCY];
    }

    transactions.push(transaction);
  }

  return { transactions, accounts, currencies };
}




function getAmount(row) {
  return parseFloat(row[COLUMN.AMOUNT].replace(',', '.'));
}

function getKind(row) {
  return row[COLUMN.TRANSFER].trim()
    ? Transfer
    : getAmount(row) < 0
      ? Expense
      : Income;
}

function getAccount(row) {
  const account = row[COLUMN.ACCOUNT];
  const currency = row[COLUMN.CURRENCY];
  if (!accounts.has(account)) accounts.set(account, new Set());
  const accountCurrencies = accounts.get(account);
  if (!accountCurrencies.has(currency)) accountCurrencies.add(currency);
  if (!currencies.has(currency)) currencies.add(currency);

  return account;
}

function getDate(row) { // 他期待的日期格式到底是什么？
  return (new Date(row[COLUMN.DATE].split('.').join('-'))).getTime();
}

function getTags(row) { // xxx\xxx\xxx
  return (
    row[COLUMN.TAGS].trim() && {
      [getKind(row)]: row[COLUMN.TAGS].replace('\\', '/').split('/')
    }
  );
}
