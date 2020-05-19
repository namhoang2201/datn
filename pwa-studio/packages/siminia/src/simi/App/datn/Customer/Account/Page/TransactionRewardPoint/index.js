import React from 'react';
import TransactionHistory from './TransactionHistory/TransactionList';
import Identify from "src/simi/Helper/Identify";
import TitleHelper from 'src/simi/Helper/TitleHelper';
import { getTransactions } from 'src/simi/Model/TransactionPoint'
require('./index.scss')

class Transaction extends React.Component {

    constructor(props) {
        super(props)
        this.state = ({ data: null })
    }

    componentDidMount() {
        getTransactions(this.processData, {})
    }

    processData = (data) => {
        this.setState({ data: data })
    }

    render() {
        
        return (
            <div className='account-my-orders-history'>
                {TitleHelper.renderMetaHeader({
                    title: Identify.__('RewardPoint Transaction History'),
                    desc: Identify.__('RewardPoint Transaction History')
                })}
                <div className="order-history">
                    <div className="customer-page-title">
                        {Identify.__("RewardPoint Transaction History")}
                    </div>
                    <div className='account-my-orders transaction'>
                        <TransactionHistory data={this.state.data} />
                    </div>
                </div>
            </div>
        )
    }
}

export default Transaction;