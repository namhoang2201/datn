import React from 'react';
import { Form } from 'informed';
import { validators } from './validators';
import Identify from 'src/simi/Helper/Identify';
import TextInput from 'src/components/TextInput';
import TitleHelper from 'src/simi/Helper/TitleHelper';
import { showToastMessage } from 'src/simi/Helper/Message';
import { showFogLoading, hideFogLoading } from 'src/simi/BaseComponents/Loading/GlobalLoading';
import { toggleMessages } from 'src/simi/Redux/actions/simiactions';
import { connect } from 'src/drivers';
import { smoothScrollToView } from 'src/simi/Helper/Behavior';
import { createPassword } from 'src/simi/Model/Customer';
import { Link } from 'react-router-dom';
import Cookies from 'universal-cookie';
require('./index.scss');

const $ = window.$;
class ResetPassword extends React.Component {
	constructor(props) {
		super(props);
		this.token = false;
		this.email = null;
		const params = new URL(window.location.href);
		if (params && params.searchParams.get('token')) {
			this.token = params.searchParams.get('token');
		}
		if (params && params.searchParams.get('mail')) {
			this.email = params.searchParams.get('mail');
		}
		if (!this.token) {
			console.log('no token');
		}
	}

	componentDidMount() {
		$('#siminia-main-page').addClass('login-main-page')
	}

	componentWillUnmount(){
		$('#siminia-main-page').removeClass('login-main-page')
	}

	render() {
		const handleSubmit = (values) => {
			showFogLoading();
			if (!this.token) {
				console.log('no token');
				const msg = Identify.__('Your link reset password is invalid !');
				showToastMessage(msg);
			} else {
				console.log('have token : ' + this.token);
				createPassword(createDone, { rptoken: this.token, password: values.password });
			}
		};

		const createDone = (data) => {
			if (data.errors) {
				console.log('nooo');
				let errorMsg = '';
				if (data.errors.length) {
					data.errors.map((error) => {
						errorMsg += error.message;
					});
					hideFogLoading();
					showToastMessage(errorMsg);
				}
			} else {
				hideFogLoading();
				smoothScrollToView($('#id-message'));
				const successMsg = Identify.__('Updated new password successfully !');
				// reset form
				$('.form')[0].reset();
				// clear user name and password save in local storage
				const cookies = new Cookies();
				if (cookies.get('user_email') && cookies.get('user_password')) {
					cookies.remove('user_email');
					cookies.remove('user_password');
				}
				showToastMessage(successMsg);
				// this.props.toggleMessages([{ type: 'success', message: successMsg, auto_dismiss: true }]);
			}
		};

		return (
			<>
				{TitleHelper.renderMetaHeader({
					title: Identify.__('Reset Customer Password')
				})}
				<div className="container resetpass-container">
					<button className="btn-back">
						<span>
							<Link to={'/'}>{Identify.__('back').toUpperCase()}</Link>
						</span>
					</button>
				</div>
				<div className="forgot-password-customer" id="id-message">
					<div className="title">
						<span>{Identify.__('reset password').toUpperCase()}</span>
					</div>
					<div className="wrap">
						<p className="description-form">
							{Identify.__('Enter a new password for account: ')}
							<span>{this.email}</span>
						</p>
						<Form className="form" getApi={this.setFormApi} onSubmit={handleSubmit}>
							<div className="newPassword">
								<TextInput
									style={{ paddingLeft: '56px' }}
									field="password"
									type="password"
									autoComplete="new-password"
									validate={validators.get('password')}
									validateOnBlur
									placeholder="New Password"
								/>
							</div>
							<div className="confirmPassword">
								<TextInput
									style={{ paddingLeft: '56px' }}
									field="confirm"
									type="password"
									validate={validators.get('confirm')}
									validateOnBlur
									placeholder="Confirm New Password"
								/>
							</div>
							<div className="resetPassword">
								<button
									priority="high"
									className="resetPassBtn"
									type="submit"
									style={{ backgroundColor: '#101820', color: '#fff' }}
								>
									{Identify.__('Reset My Password').toUpperCase()}
								</button>
							</div>
						</Form>
					</div>
				</div>
			</>
		);
	}
}

const mapDispatchToProps = {
	toggleMessages
};

export default connect(null, mapDispatchToProps)(ResetPassword);
