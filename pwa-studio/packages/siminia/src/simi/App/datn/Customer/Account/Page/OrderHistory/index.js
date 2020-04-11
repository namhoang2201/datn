import React from 'react';
import OrderHistory from 'src/simi/App/datn/Customer/Account/Components/Orders/OrderList';
import Identify from "src/simi/Helper/Identify";
import { simiUseQuery } from 'src/simi/Network/Query'
import getCustomerInfoQuery from 'src/simi/queries/getCustomerInfo.graphql';
import TitleHelper from 'src/simi/Helper/TitleHelper';

const MyOrder = props => {
    const {customer} = props
    const { data } = simiUseQuery(getCustomerInfoQuery, {});
    return (
        <div className='account-my-orders-history'>
            {TitleHelper.renderMetaHeader({
                title: Identify.__('My Orders'),
                desc: Identify.__('My Orders') 
            })}
            <div className="order-history">
                <div className="customer-page-title">
                    {Identify.__("My Orders")}
                </div>
                <div className='account-my-orders'>
                    <OrderHistory data={data} showForDashboard={false} customer={customer} />
                </div>
            </div>
        </div>
    )
}

export default MyOrder;