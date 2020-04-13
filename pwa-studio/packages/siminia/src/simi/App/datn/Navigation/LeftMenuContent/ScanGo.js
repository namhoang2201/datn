import React, { Component } from 'react'
import QrReader from 'react-qr-reader'

class ScanGo extends Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="qr">
                <QrReader
                    delay={300}
                    onError={this.props.scanFail}
                    onScan={this.props.scanSuccess}
                    style={{ width: '100%' }}
                />
            </div>
        )
    }
}
export default ScanGo