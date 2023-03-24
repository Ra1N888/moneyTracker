import {
  transactionsDB,
  remoteTransactionsDB,
  destroyTransactionsDB
} from './pouchdb';
import {
  recentListLimit,
  storageToState,
  stateToStorage
} from '../../entities/Transaction';
import intersection from 'lodash/intersection';

export default {
  sync, // 双向同步
  load, // 将一个 doc 从 Storage 转成 state 类型
  getAll, // Storage => state
  loadRecent, // load 多个 docs，但不超过限制数额
  loadFiltered, // load 符合筛选条件的 docs
  save, // save to localDB
  remove, // 将doc的delete设置成true，也就是软删
  destroy, // 删除local和remote数据库
};

async function sync(readOnly = true) {
  if (!remoteTransactionsDB()) return; // if this user store data at local, remoteDB doesn't exist, don't need sync operation.
  
  const options = { batch_size: 500 };
  await transactionsDB()
    .replicate.from(remoteTransactionsDB(), options)
    .on('change', async update => { // 'change' event fires when the replication has written a new document. 
      await Promise.all(update.docs.map(processIncomingTransaction));
    });

  if (!readOnly) { // reaOnly === false , meaning this is not demo version, localDB can be replicated to the remoteDB.
    await transactionsDB().replicate.to(remoteTransactionsDB(), options);
  }
}

// *
async function processIncomingTransaction(tx) {
  if (tx._id.startsWith('T') && !tx._id.includes('-') && !tx._deleted) { // 不包含‘-‘是什么情况
    await save({
      ...tx,
      id: `T${tx.date}-${tx._id.substr(1)}`,
      date: undefined,
      tags: tx.tags && tx.tags.length ? tx.tags : undefined,
      note: tx.note && tx.note.length ? tx.note : undefined
    });
    await transactionsDB().remove(tx);
  }

  return tx;
}

function load(id) {
  return transactionsDB()
    .get(id)
    .then(storageToState)
    .catch(error => {
      if (error.status !== 404) throw error;
    });
}

function loadRecent(limit = recentListLimit) {
  return transactionsDB()
    .allDocs({
      include_docs: true,
      descending: true,
      startkey: 'T\uffff',
      endkey: 'T',
      limit
    })
    .then(response => response.rows.map(row => row.doc))
    .then(docs => docs.map(storageToState));
}

async function getAll() {
  return transactionsDB()
    .allDocs({
      include_docs: true,
      descending: true,
      startkey: 'T\uffff',
      endkey: 'T'
    })
    .then(response => response.rows.map(row => row.doc))
    .then(docs => docs.filter(doc => doc._id && doc._id.match(/T([0-9]+)-/)))
    .then(docs => docs.map(storageToState));
}

function loadFiltered(filters = {}) {
  return transactionsDB()
    .allDocs({
      include_docs: true,
      descending: true,
      startkey: filters.date ? `T${filters.date.end}-\uffff` : 'T\uffff',
      endkey: filters.date ? `T${filters.date.start}-` : 'T'
    })
    .then(response => response.rows.map(row => row.doc))
    .then(docs => filterByAccount(docs, filters.accounts))
    .then(docs => filterByTags(docs, filters.tags))
    .then(docs => docs.map(doc => storageToState(doc)));
}

/**
 * Filter transactions by account.
 *
 * @param {array} docs
 * @param {Set} accounts
 * @return {array}
 */
function filterByAccount(docs, accounts) {
  if (Array.isArray(accounts)) accounts = new Set(accounts);
  if (!accounts || !accounts.size) return docs;

  return docs.filter(
    tx => accounts.has(tx.accountId) || accounts.has(tx.linkedAccountId)
  );
}

/**
 * Filter transactions by tag.
 *
 * @param {array} docs
 * @param {array} tags
 * @return {array}
 */
function filterByTags(docs, tags) {
  return tags && tags.length > 0
    ? docs.filter(tx => intersection(tx.tags, tags).length > 0)
    : docs;
}


// what's its function
// {
//   ...tx,
//   id: `T${tx.date}-${tx._id.substr(1)}`,
//   date: undefined,
//   tags: tx.tags && tx.tags.length ? tx.tags : undefined,
//   note: tx.note && tx.note.length ? tx.note : undefined
// }

function save(transaction) {
  return transactionsDB()
    .get(transaction.id)
    .then(doc =>
      transactionsDB().put({ // update a doc
        ...doc,
        ...stateToStorage(transaction)
      })
    )
    .catch(err => {
      if (err.status !== 404) throw err;

      return transactionsDB().put({ // create a new doc
        _id: transaction.id,
        ...stateToStorage(transaction)
      });
    });
}

function remove(id) {
  if (!id) return false;

  return transactionsDB()
    .get(id)
    .then(doc =>
      transactionsDB()
        .put({ ...doc, _deleted: true })
        .then(() => doc)
    )
    .catch(err => {
      if (err.status !== 404) throw err;
      return false;
    });
}

function destroy() {
  return destroyTransactionsDB();
}
