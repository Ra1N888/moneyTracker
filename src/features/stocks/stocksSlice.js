import {
    createSlice,
    createAsyncThunk,
    createEntityAdapter,
} from '@reduxjs/toolkit'
import AccountsStorage from '../../util/storage/stocks'

const stocksAdapter = createEntityAdapter()
const initialState = stocksAdapter.getInitialState({
    status: 'idle',
})

// Thunk functions
export const loadStocks = createAsyncThunk(
    'stocks/loadStocks',
    async () => {
        // const response = await client.get('/fakeApi/todos')
        // return response.stocks
        const accountsStorageData = await AccountsStorage.loadAll()

        // const filterAcountsStorageData = accountsStorageData.filter((item) => {

        //     // console.log('what in it: '+JSON.stringify(item)+ Object.prototype.toString.call(item))
        //     return item.id !== undefined
        // })
        return accountsStorageData
    }
)

export const saveStock = createAsyncThunk(
    'stocks/saveStock',
    async (obj) => {
        console.log('you here')
        await AccountsStorage.save(obj)
        return obj
    }
)

export const removeStock = createAsyncThunk(
    'stocks/removeStock',
    async (stockId) => {
        console.log('remove stock slice')
        await AccountsStorage.remove(stockId)
        return stockId
    }
)



const stocksSlice = createSlice({
    name: 'stocks',
    initialState,
    reducers: {
        // todoDeleted: stocksAdapter.removeOne,
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadStocks.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(loadStocks.fulfilled, (state, action) => {
                stocksAdapter.setAll(state, action.payload)
                state.status = 'idle'
            })
            .addCase(saveStock.fulfilled, stocksAdapter.setOne)
            .addCase(removeStock.fulfilled, stocksAdapter.removeOne)
    },
})

export default stocksSlice.reducer