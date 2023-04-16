import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Button, Icon, Modal, Header, Form, Dropdown, Input, Label } from 'semantic-ui-react'
import format from 'date-fns/format';
import { saveTransaction } from 'actions/entities/transactions';
import { saveStock, loadStocks, removeStock } from '../features/stocks/stocksSlice'

const WorkInProgress = () => {


    const [openAdd, setOpenAdd] = useState(false)
    const [openBuy, setOpenBuy] = useState(false)
    const [openSold, setOpenSold] = useState(false)

    const [operationStockId, setOperationStockId] = useState()

    // const form = useSelector((state) => state.ui.form.transaction)
    const stocksIds = useSelector((state) => state.stocks.ids)
    const stocksItems = useSelector((state) => state.stocks.entities)
    const loadingStatus = useSelector((state) => state.stocks.status)

    // console.log('stockids: ' + stocksIds)
    const accounts = useSelector((state) => state.entities.accounts)
    const accountsOptions = generateAccountsOptions(accounts.byKey)
    const accountId = useSelector((state) => state.ui.form.transaction.accountId)

    // console.log('stocksentities: ' + JSON.stringify(stocksItems))
    // const dispatch = useDispatch()
    // console.log('state_form: ' + JSON.stringify(form))

    const operationCell = (stockId) => {
        return (
            <Button.Group>
                <Button onClick={() => handleSold(stockId)} >卖出</Button>
                <Button.Or />
                <Button positive onClick={() => handleBuy(stockId)}>买入</Button>
            </Button.Group>
        )
    }
    const profitCounter = (cur, pre, number) => {
        //计算两个值：持有收益 and 收益率
        const netProfit = ((cur - pre) * number).toFixed(2)
        const profitRate = ((cur - pre) / pre * 100).toFixed(2) + "%"

        const flag = netProfit > 0 ? '#11A846' : '#FF0000'
        return (
            <>
                <span style={{ 'color': flag }}>{netProfit}</span>
                <span>&nbsp;/&nbsp;</span>
                <span style={{ 'color': flag }}>{profitRate}</span>
            </>
        )
    }

    const handleBuy = (stockId) => {
        setOpenBuy(true)
        setOperationStockId(stockId)
    }
    const handleSold = (stockId) => {
        setOpenSold(true)
        setOperationStockId(stockId)
    }

    if (loadingStatus === 'loading') return 'loaaaaaading'
    return (
        <div style={{ margin: '10px', boxShadow: '0 2px 4px 0 rgba(34, 36, 38, 0.12), 0 2px 10px 0 rgba(34, 36, 38, 0.15)' }}>
            <Table celled padded>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell width={2} textAlign='center' singleLine>代号</Table.HeaderCell>
                        <Table.HeaderCell width={1}>数量</Table.HeaderCell>
                        <Table.HeaderCell width={1}>买入价格</Table.HeaderCell>
                        <Table.HeaderCell width={1}>现价</Table.HeaderCell>
                        <Table.HeaderCell width={1}>利润</Table.HeaderCell>
                        <Table.HeaderCell width={4}>操作</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {
                        stocksIds.map((stockId) =>
                            <Table.Row key={stockId}>
                                <Table.Cell textAlign='center'>{stocksItems[stockId].symbol}</Table.Cell>
                                <Table.Cell>{stocksItems[stockId].number}</Table.Cell>
                                <Table.Cell>{stocksItems[stockId].price}</Table.Cell>
                                <Table.Cell>{localStorage.getItem(stockId)}</Table.Cell>
                                <Table.Cell>{profitCounter(localStorage.getItem(stockId), stocksItems[stockId].price, stocksItems[stockId].number)}</Table.Cell>
                                <Table.Cell>{operationCell(stockId)}</Table.Cell>
                            </Table.Row>
                        )
                    }
                </Table.Body>
                <Table.Footer fullWidth>
                    <Table.Row>
                        <Table.HeaderCell colSpan='6'>
                            <Button
                                floated='left'
                                icon
                                labelPosition='left'
                                primary
                                onClick={() => setOpenAdd(true)}
                            >
                                <Icon name='add to cart' /> 添加股票
                            </Button>
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Footer>
            </Table>
            {openAdd && <StockAddForm open={openAdd} setOpen={setOpenAdd} accountsOptions={accountsOptions} accountId={accountId} />}
            {openBuy && <BuyStockForm open={openBuy} setOpen={setOpenBuy} accountsOptions={accountsOptions} operationStockId={operationStockId} accountId={accountId} />}
            {openSold && <SoldStockForm open={openSold} setOpen={setOpenSold} accountsOptions={accountsOptions} operationStockId={operationStockId} accountId={accountId} />}
        </div>
    )
}

// interface StockAddFormProps {
//     open: boolean,
//     setOpen: React.Dispatch<React.SetStateAction<boolean>>,
// }

const StockAddForm = ({ open, setOpen, accountsOptions, accountId }) => {

    const dispatch = useDispatch()
    const today = format(new Date(), 'YYYY-MM-DD')

    // const accounts = useSelector((state) => state.entities.accounts)
    // const accountsOptions = generateAccountsOptions(accounts.byKey)

    // const accountId = useSelector((state) => state.ui.form.transaction.accountId)


    const [isLoading, setIsLoading] = useState(false)
    const [selectedAccountId, setSelectedAccountId] = useState(accountId)
    const [selectedDate, setSelectedDate] = useState(today)

    // stock form
    const symbolRef = useRef()
    const numberRef = useRef(0)
    const priceRef = useRef(0)

    const generateExpenseCentAmount = () => {
        const floatNumber = (numberRef.current) * (priceRef.current)
        const centNumber = Number(floatNumber.toFixed(2)) * 100
        const centNumberWithPre = centNumber * (-1)
        console.log('generateExpenseCentAmount: ' + centNumberWithPre)
        return centNumberWithPre
    }
    // console.log('form render: ' + selectedAccountId)

    // payload: {
    //     kind: 0,
    //     isModalOpen: false,
    //     accountId: 'A1679048473811',
    //     currency: 'CNY',
    //     amount: -14500,
    //     linkedAccountId: 'A1679059217878',
    //     linkedCurrency: 'CNY',
    //     tags: [
    //       '化妆品'
    //     ],
    //     date: 1679788800000,

    useEffect(() => {
        console.log('trigger')
        setSelectedAccountId(accountId)
    }, [accountId])

    const handleSubmit = async (event) => {
        event.preventDefault()

        const payload = { // saveTransaction payload
            kind: 0,
            isModalOpen: true,
            accountId: selectedAccountId,
            currency: 'USD',
            amount: generateExpenseCentAmount(),
            linkedAccountId: selectedAccountId,
            linkedCurrency: 'USD',
            tags: [
                'stock'
            ],
            note: symbolRef.current,
            date: new Date(selectedDate).getTime(),
            id: '',
        }

        console.log('submit payload: ' + JSON.stringify(payload))
        const stockToSave = {
            id: `S${Date.now()}`,
            symbol: symbolRef.current,
            number: numberRef.current,
            price: priceRef.current,
        }

        setIsLoading(true)

        // check whether exist this symbol
        const stockPriceServiceUrl = process.env.REACT_APP_STOCKPRICE_URL
        fetch(`${stockPriceServiceUrl}?symbol=${stockToSave.symbol}`)
            .then(body => body.json())
            .then(res => {
                const errorMessage = res.error
                if (errorMessage) {
                    alert('fail to add: illegal symbol!')
                } else {
                    localStorage.setItem(stockToSave.id, res.price)
                    dispatch(saveStock(stockToSave))
                    dispatch(saveTransaction(payload))
                }
            })
            .catch(err => {
                console.log(err)
            })
            .then(() => {
                setIsLoading(false)
                setOpen(false)

                setSelectedAccountId(accountId)
                setSelectedDate(today)
            })
    };

    const handleSymbolChange = (e) => {
        console.log('symbolchange: ' + e.target.value)
        symbolRef.current = e.target.value
    }
    const handleNumberChange = (e) => {
        numberRef.current = Number(e.target.value)
    }
    const handlePriceChange = (e) => {
        priceRef.current = Number(e.target.value)
    }
    const handleAccountChange = (e, { value }) => {
        setSelectedAccountId(value)
        console.log('accountChange: ' + value)
    }
    const handleDateChange = (e) => {
        console.log('dateChange: ' + e.target.value)
        setSelectedDate(e.target.value)
    }

    return (
        <Modal
            closeIcon
            open={open}
            onClose={() => {
                setOpen(false)
                setSelectedAccountId(accountId)
                setSelectedDate(today)
            }}
        >
            <Header icon='add to cart' content='新股票' />
            <Modal.Content>
                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Field required width={4}>
                            <label>代号</label>
                            <Input
                                required
                                onChange={handleSymbolChange}
                            />
                        </Form.Field>
                        <Form.Field required width={4}>
                            <label>数量</label>
                            <Input
                                required
                                type='number'
                                onChange={handleNumberChange}
                            />
                        </Form.Field>
                        <Form.Field required width={4}>
                            <label>买入价格</label>
                            <Input
                                required
                                type='number'
                                step=".01"
                                label={{ basic: true, content: '$' }}
                                labelPosition='right'
                                onChange={handlePriceChange}
                            />
                        </Form.Field>
                    </Form.Group>
                    <Form.Group>
                        <Form.Field width={4} className="mobile-with-margin">
                            <label>来自</label>
                            <Dropdown
                                selection
                                options={accountsOptions}
                                value={selectedAccountId}
                                onChange={handleAccountChange}
                            />
                        </Form.Field>
                        <Form.Field width={4}>
                            <label>日期</label>
                            <Input
                                required
                                fluid
                                type="date"
                                value={selectedDate}
                                onChange={handleDateChange}
                            />
                        </Form.Field>
                    </Form.Group>
                    <Form.Button
                        width={5}
                        primary
                        fluid
                        icon='add square'
                        content="Add"
                        loading={isLoading}
                    />
                </Form>
            </Modal.Content>
        </Modal>
    )
}

const BuyStockForm = ({ open, setOpen, accountsOptions, operationStockId, accountId }) => {


    const dispatch = useDispatch()

    const today = format(new Date(), 'YYYY-MM-DD')
    const currentPrice = localStorage.getItem(operationStockId)

    // const [isLoading, setIsLoading] = useState(false)

    const [selectedAccountId, setSelectedAccountId] = useState(accountId)
    const [selectedDate, setSelectedDate] = useState(today)
    const [number, setNumber] = useState(0)

    // const stockInfo = useSelector(state => state.stocks.entities)
    const stockInfo = useSelector(state => state.stocks.entities[operationStockId])
    console.log('stockInfo: ' + JSON.stringify(stockInfo))

    const handleNumberChange = (e) => {

        // e.target.value 居然是 string type, need to exchange to number type
        setNumber(Number(e.target.value))

        // const numbertype = Number(e.target.value)
        // console.log('input numberxxxxx: ' + numbertype)
        // console.log('its type: ' + Object.prototype.toString.call(numbertype))
    }
    const handleDateChange = (e) => {
        setSelectedDate(e.target.value)
    }
    const handleAccountChange = (e, { value }) => {
        setSelectedAccountId(value)
        console.log('accountChange: ' + value)
    }


    const generateExpenseCentAmount = () => {
        const floatNumber = number * currentPrice
        const centNumber = Number(floatNumber.toFixed(2)) * 100
        const centNumberWithPre = centNumber * (-1) // 负数
        console.log('generateExpenseCentAmount: ' + centNumberWithPre)
        return centNumberWithPre
    }

    const generateCostPrice = () => {
        const floatNumber = (Number(stockInfo.number) * Number(stockInfo.price) + number * Number(currentPrice)) / (Number(stockInfo.number) + number)
        const res = Number(floatNumber.toFixed(2))
        console.log('generateNewCostPrice: ' + res)
        return res // number type result
    }

    const handleSubmit = (event) => {

        // alert('submit')
        event.preventDefault()

        const payload = { // saveTransaction payload
            kind: 0,
            isModalOpen: false,
            accountId: selectedAccountId,
            currency: 'USD',
            amount: generateExpenseCentAmount(),
            linkedAccountId: selectedAccountId,
            linkedCurrency: 'USD',
            tags: [
                'stock'
            ],
            note: `buy ${number} ${stockInfo.symbol}`,
            date: new Date(selectedDate).getTime(),
            id: '',
        }

        console.log('submit buy stocks payload: ' + JSON.stringify(payload))

        const stockToSave = {
            id: operationStockId,
            symbol: stockInfo.symbol,
            number: Number(stockInfo.number) + number,
            price: generateCostPrice(),
        }

        console.log('stocktosave: ' + JSON.stringify(stockToSave))

        // setIsLoading(true)

        // check whether exist this symbol
        // const stockPriceServiceUrl = process.env.REACT_APP_STOCKPRICE_URL

        // fetch(`${stockPriceServiceUrl}?symbol=${stockToSave.symbol}`)
        //     .then(body => body.json())
        //     .then(res => {
        //         const errorMessage = res.error
        //         if (errorMessage) {
        //             alert('fail to add: illegal symbol!')
        //         } else {
        //             localStorage.setItem(stockToSave.id, res.price)


        dispatch(saveStock(stockToSave))
        dispatch(saveTransaction(payload))

        setOpen(false)
        setSelectedAccountId(accountId)
        setSelectedDate(today)

        //     }
        // })
        // .catch(err => {
        //     console.log(err)
        // })
        // .then(() => {
        //     setIsLoading(false)
        //     setOpen(false)

        //     setSelectedAccountId(accountId)
        //     setSelectedDate(today)
        // })
    }

    useEffect(() => {
        console.log('trigger')
        setSelectedAccountId(accountId)
    }, [accountId])

    return (
        <Modal
            closeIcon
            open={open}
            onClose={() => {
                setOpen(false)
                setSelectedAccountId(accountId)
                setSelectedDate(today)
            }}
        >
            <Header
                icon='cart plus'
                content={`买入 ${stockInfo.symbol}`}
            />
            <Modal.Content>
                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Field width={2}>
                            <label>现价</label>
                            <Label size='large' color='teal'>
                                {currentPrice}
                            </Label>
                        </Form.Field>
                        <Form.Field required width={4}>
                            <label>数量</label>
                            <Input
                                required
                                type='number'
                                onChange={handleNumberChange}
                            />
                        </Form.Field>
                        <Form.Field width={4}>
                            <label>来自</label>
                            <Dropdown
                                selection
                                options={accountsOptions}
                                value={selectedAccountId}
                                onChange={handleAccountChange}
                            />
                        </Form.Field>
                        <Form.Field width={4}>
                            <label>日期</label>
                            <Input
                                required
                                fluid
                                type="date"
                                value={selectedDate}
                                onChange={handleDateChange}
                            />
                        </Form.Field>
                    </Form.Group>
                    <Form.Button
                        width={5}
                        primary
                        fluid
                        icon='add square'
                        content="Buy"
                    // loading={isLoading}
                    />
                </Form>
            </Modal.Content>
        </Modal>
    )
}

const SoldStockForm = ({ open, setOpen, accountsOptions, operationStockId, accountId }) => {

    const dispatch = useDispatch()

    const today = format(new Date(), 'YYYY-MM-DD')
    const currentPrice = localStorage.getItem(operationStockId)

    // const [isLoading, setIsLoading] = useState(false)

    const [selectedAccountId, setSelectedAccountId] = useState(accountId)
    const [selectedDate, setSelectedDate] = useState(today)
    const [number, setNumber] = useState(0)

    // const stockInfo = useSelector(state => state.stocks.entities)
    const stockInfo = useSelector(state => state.stocks.entities[operationStockId])
    console.log('stockInfo: ' + JSON.stringify(stockInfo))

    const handleNumberChange = (e) => {
        // e.target.value 居然是 string type, need to exchange to number type
        setNumber(Number(e.target.value))
    }
    const handleDateChange = (e) => {
        setSelectedDate(e.target.value)
    }
    const handleAccountChange = (e, { value }) => {
        setSelectedAccountId(value)
        console.log('accountChange: ' + value)
    }

    const generateExpenseCentAmount = () => {
        const floatNumber = number * currentPrice
        const centNumber = Number(floatNumber.toFixed(2)) * 100
        const centNumberWithPre = centNumber * (1) // 正数
        console.log('generateExpenseCentAmount: ' + centNumberWithPre)
        return centNumberWithPre
    }

    // 计算每股的成本价格
    const generateCostPrice = () => {
        const floatNumber = (Number(stockInfo.number) * Number(stockInfo.price) - number * Number(currentPrice)) / (Number(stockInfo.number) - number)
        const res = Number(floatNumber.toFixed(2))
        console.log('sold stock then generateNewCostPrice: ' + res)
        return res // number type result
    }

    const handleSubmit = (event) => {
        // alert('submit')
        event.preventDefault()

        const payload = { // saveTransaction payload
            kind: 2,
            isModalOpen: false,
            accountId: selectedAccountId,
            currency: 'USD',
            amount: generateExpenseCentAmount(),
            linkedAccountId: selectedAccountId,
            linkedCurrency: 'USD',
            tags: [
                'stock'
            ],
            note: `sold ${number} ${stockInfo.symbol}`,
            date: new Date(selectedDate).getTime(),
            id: '',
        }

        console.log('submit sold stocks payload: ' + JSON.stringify(payload))


        if (number !== Number(stockInfo.number)) { // 卖出股数 < 持有数
            const stockToSave = {
                id: operationStockId,
                symbol: stockInfo.symbol,
                number: Number(stockInfo.number) - number,
                price: generateCostPrice(),
            }
            console.log('stocktosave: ' + JSON.stringify(stockToSave))
            dispatch(saveStock(stockToSave))
        }
        else { // 卖出股数 = 持有数, 我们需要删除 stockdb 里的这个 doc 以及 redux 的 stocks state
            dispatch(removeStock(operationStockId))
        }

        dispatch(saveTransaction(payload))

        setOpen(false)
        setSelectedAccountId(accountId)
        setSelectedDate(today)
    }

    useEffect(() => {
        console.log('trigger')
        setSelectedAccountId(accountId)
    }, [accountId])

    return (
        <Modal
            closeIcon
            open={open}
            onClose={() => {
                setOpen(false)
                setSelectedAccountId(accountId)
                setSelectedDate(today)
            }}
        >
            <Header
                icon='cart plus'
                content={`卖出 ${stockInfo.symbol}`}
            />
            <Modal.Content>
                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Field width={2}>
                            <label>现价</label>
                            <Label size='large' color='teal'>
                                {currentPrice}
                            </Label>
                        </Form.Field>
                        <Form.Field required width={4}>
                            <label>数量</label>
                            <Input
                                required
                                type='number'
                                min="1" max={(stockInfo.number).toString()}
                                onChange={handleNumberChange}
                            />
                        </Form.Field>
                        <Form.Field width={4}>
                            <label>进至</label>
                            <Dropdown
                                selection
                                options={accountsOptions}
                                value={selectedAccountId}
                                onChange={handleAccountChange}
                            />
                        </Form.Field>
                        <Form.Field width={4}>
                            <label>日期</label>
                            <Input
                                requiredf f s
                                fluid
                                type="date"
                                value={selectedDate}
                                onChange={handleDateChange}
                            />
                        </Form.Field>
                    </Form.Group>
                    <Form.Button
                        width={5}
                        primary
                        fluid
                        icon='add square'
                        content="Sold"
                    />
                </Form>
            </Modal.Content>
        </Modal>
    )



}




function generateAccountsOptions(accounts) {

    const options = []

    for (const id of Object.keys(accounts)) {
        options.push({
            key: id,
            value: id,
            text: accounts[id].name,
        });
    }
    console.log('options: ' + JSON.stringify(options))
    return options;


}

export default WorkInProgress