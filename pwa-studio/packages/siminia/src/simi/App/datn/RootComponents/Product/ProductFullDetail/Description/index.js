import React from 'react'
import Identify from 'src/simi/Helper/Identify';
import RichText from 'src/simi/BaseComponents/RichText';
import QRCode from "qrcode.react";

require('./description.scss')

const Description = props => {
    const { product } = props
    return (
        <React.Fragment>
            <h2 className="description-title">
                <span>{Identify.__('Description')}</span>
            </h2>
            <RichText className="description-content" content={product.description.html} />
            <div className="qr">
                <QRCode
                    className="qrcode-product"
                    id='qrcode'
                    value={product.id+''}
                    size={290}
                    level={'H'}
                    includeMargin={true}
                />
            </div>
        </React.Fragment>
    )
}

export default Description
