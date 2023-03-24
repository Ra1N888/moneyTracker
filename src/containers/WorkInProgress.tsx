import React, { useState } from 'react';
import { Table, Button, Icon, Modal, Header, Form, Dropdown, Input } from 'semantic-ui-react'

const options = [
    { key: 's', text: '上交所', value: '.ss' },
    { key: 'z', text: '深交所', value: '.sz' },
    { key: 'g', text: '港交所', value: '.HK' },
    { key: 'm', text: '纳斯达克', value: '' },
]

const WorkInProgress = () => {


    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = (event: any) => {
        event.preventDefault()
        alert('submit')
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
            setOpen(false)
        }, 1000);
    };

    return (
        <div>
            <Table celled padded>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell singleLine>代码</Table.HeaderCell>
                        <Table.HeaderCell>名称</Table.HeaderCell>
                        <Table.HeaderCell>数量</Table.HeaderCell>
                        <Table.HeaderCell>成本价格</Table.HeaderCell>
                        <Table.HeaderCell>当前股价</Table.HeaderCell>
                        <Table.HeaderCell>交易</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                </Table.Body>

                <Table.Footer fullWidth>
                    <Table.Row>
                        <Table.HeaderCell colSpan='6'>
                            <Button
                                floated='right'
                                icon
                                labelPosition='left'
                                primary
                                onClick={() => setOpen(true)}
                            >
                                <Icon name='add to cart' /> Add Stock
                            </Button>
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Footer>
            </Table>

            <Modal
                closeIcon
                open={open}
                onClose={() => setOpen(false)}

            >
                <Header icon='add to cart' content='Add New Stock' />
                <Modal.Content>

                    <Form onSubmit={handleSubmit}>

                        <Form.Group>
                            <Form.Field required width={7}>
                                <label>股票代码</label>
                                <Input
                                    required
                                    label={<Dropdown defaultValue='' options={options} />}
                                    labelPosition='right'
                                    placeholder='Find domain'
                                />
                            </Form.Field>
                            <Form.Field required width={4}>
                                <label>数量</label>
                                <Input
                                    required
                                    type='number'
                                />
                            </Form.Field>
                            <Form.Field required width={4}>
                                <label>股价</label>
                                <Input
                                    required
                                    type='number'
                                    label={{ basic: true, content: '¥' }}
                                    labelPosition='right'
                                />
                            </Form.Field>
                        </Form.Group>
                        <Form.Button
                            width={4}
                            primary
                            fluid
                            icon='add square'
                            content="Add"
                            loading={isLoading}
                        />
                    </Form>
                </Modal.Content>
            </Modal>
        </div>
    )
}

export default WorkInProgress