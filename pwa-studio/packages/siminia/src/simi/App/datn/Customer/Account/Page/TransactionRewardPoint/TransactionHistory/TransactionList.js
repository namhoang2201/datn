import React, { useState } from 'react';
import Identify from 'src/simi/Helper/Identify'
import { formatPrice } from 'src/simi/Helper/Pricing';
import PaginationTable from './PaginationTable';
import { Link } from 'react-router-dom';
import defaultClasses from './style.scss'
import classify from "src/classify";
import { toggleMessages } from 'src/simi/Redux/actions/simiactions';
import { connect } from 'src/drivers';
import { compose } from 'redux';
import Loading from 'src/simi/BaseComponents/Loading'
import { smoothScrollToView } from 'src/simi/Helper/Behavior';

const TransactionList = props => {
    const { showForDashboard, data } = props
    const [limit, setLimit] = useState(10);
    const [title, setTitle] = useState(10)

    const scrollTop = () => {
        smoothScrollToView($('#root'));
    }
    const cols =
        [
            { title: Identify.__("Transaction ID"), width: "" },
            { title: Identify.__("Increment ID"), width: "" },
            { title: Identify.__("Point before"), width: "" },
            { title: Identify.__("Point earned"), width: "" },
            { title: Identify.__("Point spent"), width: "" },
            { title: Identify.__("Grand total before"), width: "" },
            { title: Identify.__("Discount amount"), width: "" },
            { title: Identify.__("Final grand total"), width: "" },
            { title: Identify.__("Created on"), width: "" },
            { title: Identify.__("Action"), width: "" }
        ];
    const currentPage = 1;

    const renderTransactionItem = (item, index) => {
        const arr = item.created_time.split(/[- :]/);
        let date = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]);
        let m = date.getMonth() + 1;
        m = m < 10 ? "0" + m : m;
        date = date.getDate() + "/" + m + "/" + date.getFullYear();
        const orderData = item
        orderData.increment_id = item.np_increment_id
        const location = {
            pathname: "/orderdetails.html/" + item.np_increment_id,
            state: { orderData: orderData }
        };
        return (
            <tr key={index}>
                <td data-title={Identify.__("Transaction ID")}>
                    {Identify.__(item.transaction_id)}
                </td>
                <td data-title={Identify.__("Increment ID")}>
                    {Identify.__(item.np_increment_id)}
                </td>
                <td data-title={Identify.__("Point before transaction")}>
                    {Identify.__(item.point_before_transaction)}
                </td>
                <td data-title={Identify.__("Point earned")}>
                    {Identify.__(item.point_earn)}
                </td>
                <td data-title={Identify.__("Point spent")}>
                    {Identify.__(item.point_spend)}
                </td>
                <td data-title={Identify.__("Grand total before")}>
                    {Identify.__(formatPrice(item.total_before))}
                </td>
                <td data-title={Identify.__("Discount amount")}>
                    {Identify.__(formatPrice(item.discount_amount))}
                </td>
                <td data-title={Identify.__("Final grand total")}>
                    {Identify.__(formatPrice(item.total_after_discount))}
                </td>
                <td
                    data-title={Identify.__("Created on")}
                >
                    {date}
                </td>
                <td data-title="">
                    <Link onClick={() => scrollTop()} className="view-order" to={location}>{Identify.__('View order')}</Link>
                </td>
            </tr>
        )
    }
    let listTransactions = [];

    if (data && data.hasOwnProperty('transactions') && data.transactions instanceof Array && data.transactions.length > 0) {
        listTransactions = data.transactions.sort((a, b) => {
            return b.id - a.id
        })
    }
    
    return (
        <div className='customer-recent-orders'>
            {!data || !data.hasOwnProperty('transactions')
                ? (
                    <Loading />
                ) : (
                    <>
                        <div className="balance-point">
                            <div className="title">Your balance reward point: </div>
                            <div className="point">{data.balance_point}</div>
                        </div>
                        <PaginationTable
                            renderItem={renderTransactionItem}
                            data={listTransactions}
                            cols={cols}
                            showPageNumber={!showForDashboard}
                            limit={typeof (limit) === 'string' ? parseInt(limit) : limit}
                            setLimit={setLimit}
                            currentPage={currentPage}
                            title={title}
                            setTitle={setTitle}
                        />
                    </>
                )
            }
        </div>
    )
}

const mapDispatchToProps = {
    toggleMessages,
}

export default compose(
    classify(defaultClasses),
    connect(
        null,
        mapDispatchToProps
    )
)(TransactionList);
