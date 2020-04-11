import React, { Fragment } from 'react';
import { connect } from 'src/drivers';
import Identify from 'src/simi/Helper/Identify';
import Loading from "src/simi/BaseComponents/Loading";
import { simiUseQuery, SimiMutation, Simiquery } from 'src/simi/Network/Query';
import CUSTOMER_ADDRESS from 'src/simi/queries/customerAddress.graphql';
import CUSTOMER_ADDRESS_DELETE from 'src/simi/queries/customerAddressDelete.graphql';
import { toggleMessages } from 'src/simi/Redux/actions/simiactions';
import PageTitle from 'src/simi/App/datn/Customer/Account/Components/PageTitle';
import AddressItem from '../../Components/AddressItem';
import { Whitebtn } from 'src/simi/BaseComponents/Button';
import { Link } from 'src/drivers';
import { showFogLoading, hideFogLoading } from 'src/simi/BaseComponents/Loading/GlobalLoading';
import { smoothScrollToView } from 'src/simi/Helper/Behavior';

require('./style.scss');

class AddressBook extends React.Component {
    constructor(props) {
        super(props);
    }

    //add new address
    addNewAddress = (id) => {
        const { history } = this.props;
        if (id) {
            history.push(`/new-address.html/${id}`);
        } else {
            history.push('/new-address.html');
        }
    }

    componentDidMount() {
        smoothScrollToView($('#root'));
    }

    deleteAddressOther = (id, mutationCallback) => {
        if (confirm(Identify.__("Are you sure delete address?"))) {
            showFogLoading();
            mutationCallback({ variables: { id: id } });
        } else {
            return;
        }
    }

    renderDefaultAddress = (defaultBilling, defaultShipping) => {
        if (!defaultBilling && !defaultShipping) {
            return <div>{Identify.__("No default billing/shipping address selected.")}</div>
        }
        const { user } = this.props;
        return (
            <div className="address-content">
                {defaultBilling.id && <div className="address-box-col billing-address">
                    <div className="box-item-address">
                        <div className='box-title'>
                            {Identify.__('Default Billing Address')}
                        </div>
                        <AddressItem addressData={defaultBilling} customer_email={user && user.email ? user.email : ''} />
                    </div>
                    <Link to={`/new-address.html/${defaultBilling.id}`} className="edit-address-item"><span className="icon-pencil" title={Identify.__("Edit")} /></Link>
                </div>}
                {defaultShipping.id &&
                    <div className="address-box-col shipping-address">
                        <div className="box-item-address">
                            <div className='box-title'>
                                {Identify.__('Default Shipping Address')}
                            </div>
                            <AddressItem addressData={defaultShipping} customer_email={user && user.email ? user.email : ''} />
                        </div>
                        <Link to={`/new-address.html/${defaultShipping.id}`} className="edit-address-item"><span className="icon-pencil" title={Identify.__("Edit")} /></Link>
                    </div>
                }
            </div>
        )
    }


    renderAdditionalItem = (addressList) => {
        let html = null;
        if (addressList.length) {
            const { user } = this.props;
            html = addressList.map((address, idx) => {
                return <div className="address-box-col" key={idx} data-id={address.id}>
                    <div className="box-item-address">
                        <AddressItem addressData={address} customer_email={user && user.email ? user.email : ''} />
                    </div>
                    <div className="additional-item-actions">
                        <Link to={`/new-address.html/${address.id}`} className="edit-address-item"><span className="icon-pencil" title={Identify.__("Edit")} /></Link>
                        <SimiMutation mutation={CUSTOMER_ADDRESS_DELETE}>
                            {(mutationCallback, { data }) => {
                                if (data) {
                                    $('.additional-address-contain').find(`.address-box-col[data-id=${address.id}]`).remove();
                                    hideFogLoading();
                                }
                                return <div onClick={() => this.deleteAddressOther(address.id, mutationCallback)} className="del-address-item"><span className="icon-trash" title={Identify.__("Delete")} /></div>
                            }}
                        </SimiMutation>
                    </div>
                </div>
            });
        }
        return html;
    }

    render() {
        return (
            <div className="address-book">
                <PageTitle title={Identify.__("Address Book")} />
                <Simiquery query={CUSTOMER_ADDRESS} fetchPolicy="no-cache">
                    {({ loading, error, data }) => {
                        if (error) return <div>Data Fetch Error</div>;
                        if (loading) return <Loading />;

                        const { customer } = data;
                        const { addresses } = customer;
                        let defaultBilling = null;
                        let defaultShipping = null;
                        let addressList = []; //other address list

                        if (addresses && addresses.length) {
                            const findDefaultShipping = addresses.find((address) => address.hasOwnProperty('default_shipping') && address.default_shipping === true);
                            if (findDefaultShipping) defaultShipping = findDefaultShipping;

                            const findDefaultBilling = addresses.find((address) => address.hasOwnProperty('default_billing') && address.default_billing === true);
                            if (findDefaultBilling) defaultBilling = findDefaultBilling;

                            addressList = addresses.filter((item) => (item.hasOwnProperty('default_shipping') && item.default_shipping !== true) || (item.hasOwnProperty('default_billing') && item.default_billing !== true))
                        }

                        return <Fragment>
                            <div className='default-address'>
                                <div className="address-label">{Identify.__("Default Addresses")}</div>
                                {data ? this.renderDefaultAddress(defaultBilling, defaultShipping) : <Loading />}
                            </div>
                            <div className="additional-address">
                                <div className="address-label">{Identify.__("Additional Address Entries")}</div>
                                {data ? <div className="additional-address-contain">
                                    {this.renderAdditionalItem(addressList)}
                                </div> : <Loading />}
                            </div>
                            <Whitebtn onClick={() => this.addNewAddress()} text={Identify.__('Add New Address')} className='add-new-address' />
                        </Fragment>
                    }}
                </Simiquery>

            </div>
        )
    }
}

const mapStateToProps = ({ user }) => {
    const { currentUser } = user
    return {
        user: currentUser
    };
}

const mapDispatchToProps = {
    toggleMessages,
};

export default connect(mapStateToProps, mapDispatchToProps)(AddressBook);
