import React from 'react';

const Quantity = props => {
    const { initialValue, onValueChange } = props;

    const increaseVal = () => {
        const qtyField = $('#product-detail-qty')
        const qty = parseInt(qtyField.val()) + 1
        onValueChange(qty)
        $('#product-detail-qty').val(qty)
    }
    const reduceVal = () => {
        const qtyField = $('#product-detail-qty')
        const qty = parseInt(qtyField.val()) - 1
        if (qty) {
            onValueChange(qty)
            $('#product-detail-qty').val(qty)
        }
    }

    const changedValue = () => {
        const qtyField = $('#product-detail-qty')
        let qty = parseInt(qtyField.val())
        if (!Number.isInteger(parseInt(qty)) || qty <= 0) {
            qty = 1
        }
        onValueChange(qty)
        $('#product-detail-qty').val(qty)
    }
    return (
        <div className="product-quantity">
            <div className="minus-quantity" role="presentation" onClick={() => reduceVal()}>-</div>
            <input defaultValue={initialValue} id="product-detail-qty" type="number" onChange={changedValue} />
            <div className="increase-quantity" role="presentation" onClick={() => increaseVal()}>+</div>
        </div>
    );
}

export default Quantity;
