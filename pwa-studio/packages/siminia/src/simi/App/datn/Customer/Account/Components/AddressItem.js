import React from 'react';
import Identify from "src/simi/Helper/Identify";

const AddressItem = props => {
    const { addressData, customer_email } = props;

    const showAddress = (address) => {
        let result = address.map((item, index) => {
            return (
                <p key={index} className="address">
                    {item}
                </p>
            );
        });
        return result;
    }

    return (
        <div className='col-address-book'>
            <div>
                {(addressData.firstname || addressData.lastname) && <p className="customer-name">{addressData.firstname + ' ' + addressData.lastname}</p>}
                {customer_email && <p className="customer-email">{customer_email}</p>}
                {addressData.postcode && <p className="post-code-number">{addressData.postcode}</p>}
                {addressData.street &&
                    addressData.street.length > 0 &&
                    showAddress(addressData.street)}
                {addressData.city && (
                    <p className="city">{addressData.city}</p>
                )}
                {addressData.telephone && <p className="customer-phone">{addressData.telephone}</p>}
            </div>
        </div>
    )
}

export default AddressItem;
