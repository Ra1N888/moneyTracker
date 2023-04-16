import { stocksDB, remoteStocksDB, destroyStocksDB } from './pouchdb';

export default {
    sync,
    loadAll,
    save,
    remove,
    destroy
};

async function sync(readOnly = false) {

    // console.log('stock_sync_1')
    let stocks;
    stocks = await loadAll()
    // console.log('xxx: '+JSON.stringify(stocks))
    await updateLastPrice(stocks); // 更新localstorage
    // console.log('price update success')

    if (!remoteStocksDB()) return;
    
    // console.log('stock_sync_2')
    
    // remote => local
    const from = await stocksDB().replicate.from(remoteStocksDB());
    console.log('form: '+from.docs_written)
    if (from.docs_written > 0) {
        stocks = await loadAll()
        await updateLastPrice(stocks); // 更新localstorage
    }

    if (readOnly) return;

    // local => storage
    const to = await stocksDB().replicate.to(remoteStocksDB());
    console.log('to: '+to.docs_written)
    if (to.docs_written > 0) {
        stocks = await loadAll()
        await updateLastPrice(stocks); // 更新localstorage
    }

    // console.log('hei_1')
    //     const stocks = await loadAll()
    //     await updateLastPrice(stocks); // 更新localstorage

    //     console.log('hei_2')
}

function loadAll() {
    return stocksDB()
        .allDocs({
            include_docs: true,
            conflicts: true,
            startkey: 'S',
            endkey: 'S\uffff'
        })
        .then(response => response.rows.map((row, index) => {
            console.log('index_' + index + JSON.stringify(row.doc))
            return row.doc
        }))
        .then(docs => docs.map(storageToState));
}

function save(stock) { // id = '' || 'S160xxxxxxx'
    return stocksDB()
        .get(stock.id)
        .then(doc => stocksDB().put({ ...doc, ...stateToStorage(stock) }))
        .catch(err => {
            if (err.status !== 404) throw err;
            return stocksDB().put({
                _id: stock.id,
                ...stateToStorage(stock)
            });
        });
}

function remove(stockId) {
    return stocksDB()
        .get(stockId)
        .then(doc => stocksDB().put({ ...doc, _deleted: true }))
        .catch(err => {
            if (err.status !== 404) throw err;
            return true;
        });
}

function destroy() {
    return destroyStocksDB();
}

async function updateLastPrice(stocks) {
    // stocks.forEach(stock => {
    //     localStorage.setItem(stock.id, stock.price);
    // });
    const stockPriceServiceUrl = 'http://localhost:8000/realtimeStockPrice/'
    return Promise.all(
        stocks.map(stock => {

            console.log('promise_all: '+ JSON.stringify(stock))
            fetch(`${stockPriceServiceUrl}?symbol=${stock.symbol}`)
                .then(body => body.json())
                .then(res => localStorage.setItem(stock.id, res.price))
        })
    )
        .then(() => console.log('stock price update successfully!'))
        .catch(err => console.log(err))
}




function storageToState({
    _id,
    symbol,
    number,
    price,
}) {
    return {
        id: _id,
        symbol,
        number,
        price,
    }
}

function stateToStorage({
    symbol,
    number,
    price,
}) {
    return {
        symbol,
        number,
        price,
    }
}