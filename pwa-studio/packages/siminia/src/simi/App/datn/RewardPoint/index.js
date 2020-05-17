import React from 'react'
import InputRange from "react-input-range";
import { Whitebtn } from 'src/simi/BaseComponents/Button'
import Identify from 'src/simi/Helper/Identify';
import { spendPoint } from 'src/simi/Model/Cart';
import { showFogLoading, hideFogLoading } from 'src/simi/BaseComponents/Loading/GlobalLoading';
import { showToastSuccess } from 'src/simi/Helper/MessageSuccess';
require('./index.scss')

class RewardPoint extends React.Component {
    constructor(props) {
        super(props)
        this.state = { point_spend: props.pointSpend };
    }

    spendPoint = () => {
        showFogLoading()
        const params = {
            spend_point: this.state.point_spend
        }
        spendPoint(this.processData, params)
    }

    processData = (data) => {
        console.log(data)
        let text = '';
        if (data.message) {
            const messages = data.message;
            for (const i in messages) {
                const msg = messages[i];
                text += msg + ' ';
            }
        }
        showToastSuccess(text)
        this.props.getCartDetails();
    }

    render() {
        // console.log(this.props)
        return (
            <div className="nam-rewardpoint">
                <div className="wrap">
                    <div className="title">
                        Your balance points:
                    </div>
                    <div className="value">
                        {this.props.balancePoint} {this.props.balancePoint < 2 ? 'Point' : 'Points'}
                    </div>
                </div>
                <div className="wrap">
                    <div className="title">
                        You will earn:
                    </div>
                    <div className="value plus">
                        {this.props.pointEarn} {this.props.pointEarn < 2 ? 'Point' : 'Points'}
                    </div>
                </div>
                <div className="wrap-special">
                    <div className="area-apply-point">
                        <InputRange
                            maxValue={this.props.balancePoint}
                            minValue={0}
                            value={this.state.point_spend}
                            onChange={point_spend => this.setState({ point_spend })} />
                    </div>
                    <div className="wrap">
                        <div className="title">
                            You are spending:
                    </div>
                        <div className="value device">
                            {this.state.point_spend} {this.state.point_spend < 2 ? 'Point' : 'Points'}
                        </div>
                    </div>
                    <Whitebtn id="submit-point" className='submit-point' onClick={() => this.spendPoint()} text={Identify.__('Spend point')} />
                </div>
            </div>
        )
    }
}

export default RewardPoint