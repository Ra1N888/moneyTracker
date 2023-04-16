import PouchDB from 'pouchdb';


const instancePool = {}; // { setting: xxx, remote_setting: xxx, .... }

// access local databases
function instance(name) {
  if (instancePool[name] === undefined) {

    // This method creates a database or opens an existing one.
    instancePool[name] = new PouchDB(name, { auto_compaction: true }); // This option turns on auto compaction, which means compact() is called after every change to the database. Defaults to false.
  }

  return instancePool[name];
}

// access remote databases: need auth
function remoteInstance(name) {
  const instanceName = `remote_${name}`;

  if (instancePool[instanceName] === undefined) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (userInfo && userInfo.couchDB && userInfo.couchDB[name]) {
      const { username, password } = userInfo.couchDB;
      instancePool[instanceName] = new PouchDB(userInfo.couchDB[name], {
        skipSetup: true, // Initially PouchDB checks if the database exists, and tries to create it, if it does not exist yet. Set this to true to skip this setup.
        auth: username && password ? { username, password } : undefined
      });
    }else if(name === 'stocks'){
        instancePool[instanceName] = new PouchDB(`http://127.0.0.1:5984/stocks_${userInfo.couchDB.username}`, {
          skipSetup: false, // Initially PouchDB checks if the database exists, and tries to create it, if it does not exist yet. Set this to true to skip this setup.
          auth:  { username: 'admin', password: 'zy58103286' }
        });
    }
  }

  return instancePool[instanceName];
}

function destroyInstance(name) {
  if (instancePool[name] !== undefined) { // here sentence's order is important! 
    const instance = instancePool[name];
    
    // delete instancePool's property (local & remote)
    delete instancePool[name];
    delete instancePool[`remote_${name}`];

    // delete this database
    return instance.destroy();
  }
}

export const settingsDB = () => instance('settings');
export const accountsDB = () => instance('accounts');
export const transactionsDB = () => instance('transactions');
export const tagsDB = () => instance('tags');
export const stocksDB = () => instance('stocks');

export const remoteSettingsDB = () => remoteInstance('settings');
export const remoteAccountsDB = () => remoteInstance('accounts');
export const remoteTransactionsDB = () => remoteInstance('transactions');
export const remoteTagsDB = () => remoteInstance('tags');
export const remoteStocksDB = () => remoteInstance('stocks'); // 这个相当于废了

export const destroySettingsDB = () => destroyInstance('settings');
export const destroyAccountsDB = () => destroyInstance('accounts');
export const destroyTransactionsDB = () => destroyInstance('transactions');
export const destroyTagsDB = () => destroyInstance('tags');
export const destroyStocksDB = () => destroyInstance('stocks');