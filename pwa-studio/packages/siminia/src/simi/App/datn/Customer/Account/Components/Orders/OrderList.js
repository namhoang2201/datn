import React, {useState} from 'react';
import Identify from 'src/simi/Helper/Identify'
import { formatPrice } from 'src/simi/Helper/Pricing';
import PaginationTable from './PaginationTable';
import { Link } from 'react-router-dom';
import defaultClasses from './style.scss'
import classify from "src/classify";
import { toggleMessages } from 'src/simi/Redux/actions/simiactions';
import { connect } from 'src/drivers';
import { compose } from 'redux';

const OrderList = props => {
    const { showForDashboard, data } = props
    const [limit, setLimit] = useState(10);
    const [title, setTitle] = useState(10)
    const cols =
        [
            { title: Identify.__("Order #"), width: "14.02%" },
            { title: Identify.__("Date"), width: "15.67%" },
            { title: Identify.__("Ship to "), width: "33.40%" },
            { title: Identify.__("Total"), width: "12.06%" },
            { title: Identify.__("Status"), width: "12.58%" },
            { title: Identify.__("Action"), width: "12.27%" },
            // { title: Identify.__(""), width: "12.27%" }
        ];
    // const limit = 2;
    const currentPage = 1;

    // const processData = (data) => {
    //     if(data){
    //         hideFogLoading();
    //         props.toggleMessages([{type:'success', message: data.message}])
    //     }
    // }

    const renderOrderItem = (item, index) => {
        const arr = item.created_at.split(/[- :]/);
        let date = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]);
        let m = date.getMonth() + 1;
        m = m < 10 ? "0" + m : m;
        date = date.getDate() + "/" + m + "/" + date.getFullYear();

        const location = {
            pathname: "/orderdetails.html/" + item.increment_id,
            state: { orderData: item }
        };
        const shipTo = item.hasOwnProperty('customer_firstname') ? item.customer_firstname + ' ' + item.customer_lastname : (props.customer ? props.customer.firstname + ' ' + props.customer.lastname : '');
        return (
            <tr key={index}>
                <td data-title={Identify.__("Order #")}>
                    {Identify.__(item.increment_id)}
                </td>
                <td
                    data-title={Identify.__("Date")}
                >
                    {date}
                </td>
                <td data-title={Identify.__("Ship to ")}>{shipTo}</td>
                <td data-title={Identify.__("Total")}>
                    {formatPrice(item.grand_total)}
                </td>
                <td className="order-status" data-title={Identify.__("Status")}>
                    {item.status}
                </td>
                <td data-title="">
                    <Link className="view-order" to={location}>{Identify.__('View order')}</Link>
                </td>
                {/* <td data-title="">
                    <div aria-hidden onClick={()=>{
                        showFogLoading();
                        getReOrder(item.increment_id,processData)
                    }} className="view-order">{Identify.__('Re-order')}</div>
                </td> */}
            </tr>
        )
    }
    let listOrder = [];

    if(data && data.hasOwnProperty('customerOrders') && data.customerOrders.items instanceof Array && data.customerOrders.items.length > 0){
        listOrder = data.customerOrders.items.sort((a,b)=>{
            return  b.id - a.id
        })
    }
    return (
        <div className='customer-recent-orders'>
            {!data || !data.hasOwnProperty('customerOrders') || data.customerOrders.items.length === 0
                ? (
                    <div className="text-center">
                        {Identify.__("You have no items in your order")}
                    </div>
                ) : (
                    <PaginationTable
                        renderItem={renderOrderItem}
                        data={showForDashboard ? listOrder.slice(0, 3) : listOrder}
                        cols={cols}
                        showPageNumber={!showForDashboard}
                        limit={typeof(limit) === 'string' ? parseInt(limit): limit}
                        setLimit={setLimit}
                        currentPage={currentPage}
                        title={title}
                        setTitle={setTitle}
                    />
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
) (OrderList);
