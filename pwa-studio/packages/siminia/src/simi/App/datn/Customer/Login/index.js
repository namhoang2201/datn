import React, { Component } from 'react';
import defaultClasses from './login.css';
import classify from 'src/classify';
import Identify from 'src/simi/Helper/Identify';
import SignIn from './SignIn';
import CreateAccount from './CreateAccount';
import ForgotPassword from './ForgotPassword';
import { connect } from 'src/drivers';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';
import TitleHelper from 'src/simi/Helper/TitleHelper';
import { simiSignedIn, toggleMessages } from 'src/simi/Redux/actions/simiactions';
import { simiSignIn as signinApi } from 'src/simi/Model/Customer';
import { showFogLoading, hideFogLoading } from 'src/simi/BaseComponents/Loading/GlobalLoading';
import * as Constants from 'src/simi/Config/Constants';
import { Util } from '@magento/peregrine';
import { showToastMessage } from 'src/simi/Helper/Message';
import { smoothScrollToView } from 'src/simi/Helper/Behavior';

const { BrowserPersistence } = Util;
const storage = new BrowserPersistence();
const $ = window.$;

class Login extends Component {
	constructor(props) {
		super(props);
	}

	state = {
		isCreateAccountOpen: false,
		isEmailLogin: true,
		isForgotPasswordOpen: false,
		forgotPassSuccess: 'block',
		openVerifyModal: false
	};

	stateForgot = () => {
		const { history } = this.props;

		return history.location && history.location.state && history.location.state.forgot;
	};

	componentDidMount() {
		if (this.stateForgot()) {
			this.setForgotPasswordForm();
		}
		$('#siminia-main-page').addClass('login-main-page')
	}

	componentWillUnmount() {
		$('#siminia-main-page').removeClass('login-main-page')
	}

	get emailLoginForm() {
		const { isEmailLogin } = this.state;
		const { classes } = this.props;
		const isOpen = isEmailLogin;
		const className = isOpen ? classes.signIn_open : classes.signIn_closed;

		return (
			<div className={className}>
				<SignIn
					classes={classes}
					onForgotPassword={this.setForgotPasswordForm}
					onSignIn={this.onSignIn.bind(this)}
				/>
			</div>
		);
	}

	createAccount = () => { };

	setCreateAccountForm = () => {
		this.createAccount = (className, history) => {
			return (
				<div className={className}>
					<CreateAccount onSignIn={this.onSignIn.bind(this)} history={history} />
				</div>
			);
		};
		this.showCreateAccountForm();
		// $('#login-background').css('marginTop', '55px')
	};

	forgotPassword = () => { };

	setForgotPasswordForm = () => {
		this.forgotPassword = (className, history) => {
			return (
				<div className={className}>
					<ForgotPassword
						hideBuyer={this.hideBuyer}
						showBuyer={this.showBuyer}
						onClose={this.closeForgotPassword}
						history={history}
					/>
				</div>
			);
		};
		this.showForgotPasswordForm();
		// $('#login-background').css('marginTop', '55px')
	};

	hideBuyer = () => {
		this.setState({ forgotPassSuccess: 'none' });
	};
	showBuyer = () => {
		this.setState({ forgotPassSuccess: 'block' });
	};

	closeForgotPassword = () => {
		this.hideForgotPasswordForm();
	};
	hideForgotPasswordForm = () => { };

	get createAccountForm() {
		const { isCreateAccountOpen } = this.state;
		const { history, classes } = this.props;
		const isOpen = isCreateAccountOpen;
		const className = isOpen ? classes.form_open : classes.form_closed;

		return this.createAccount(className, history);
	}

	get forgotPasswordForm() {
		const { isForgotPasswordOpen } = this.state;
		const { history, classes } = this.props;
		const isOpen = isForgotPasswordOpen;
		const className = isOpen ? classes.form_open : classes.form_closed;
		return this.forgotPassword(className, history);
	}

	showCreateAccountForm = () => {
		this.setState(() => ({
			isCreateAccountOpen: true,
			isEmailLogin: false,
			isForgotPasswordOpen: false,
		}));
	};

	showForgotPasswordForm = () => {
		this.setState(() => ({
			isForgotPasswordOpen: true,
			isEmailLogin: false,
			isCreateAccountOpen: false,
		}));
	};

	showEmailLoginForm = () => {
		this.setState(() => ({
			isForgotPasswordOpen: false,
			isEmailLogin: true,
			isCreateAccountOpen: false,
		}));
	};

	onSignIn(username, password) {
		Identify.storeDataToStoreage(Identify.LOCAL_STOREAGE, Constants.SIMI_SESS_ID, null);
		signinApi(this.signinCallback.bind(this), { username, password });
		showFogLoading();
	}

	signinCallback = (data) => {
		hideFogLoading();
		if (this.props.simiSignedIn instanceof Function) {
			if (data && !data.errors) {
				storage.removeItem('cartId');
				storage.removeItem('signin_token');
				if (data.customer_access_token) {
					Identify.storeDataToStoreage(
						Identify.LOCAL_STOREAGE,
						Constants.SIMI_SESS_ID,
						data.customer_identity
					);
					setToken(data.customer_access_token);
					this.props.simiSignedIn(data.customer_access_token);
				}
			} else {
				let errorMsg = '';
				if (data.errors.length) {
					data.errors.map((error) => {
						errorMsg += error.message;
					});
					showToastMessage(Identify.__(errorMsg));
				}
			}
		}
	};

	handleGoBack = () => {
		const { history } = this.props;
		if (history) history.push('/login.html');
	};

	render() {
		const {
			createAccountForm,
			emailLoginForm,
			forgotPasswordForm,
			props,
			state
		} = this;
		const { isCreateAccountOpen, isForgotPasswordOpen, isEmailLogin } = state;

		const { classes, isSignedIn, firstname, history } = props;

		if (isSignedIn) {
			if (history.location.hasOwnProperty('pushTo') && history.location.pushTo) {
				const { pushTo } = history.location;
				history.push(pushTo);
			} else {
				history.push('/');
			}
			smoothScrollToView($('#root'));
			const message = firstname
				? Identify.__('Welcome %s Start shopping now').replace('%s', firstname)
				: Identify.__('You have succesfully logged in, Start shopping now');
			if (this.props.toggleMessages)
				this.props.toggleMessages([{ type: 'success', message: message, auto_dismiss: true }]);
		}

		return (
			<React.Fragment>
				{isEmailLogin && TitleHelper.renderMetaHeader({
					title: Identify.__('Sign In')
				})}
				{isCreateAccountOpen && TitleHelper.renderMetaHeader({
					title: Identify.__('Create Account')
				})}
				{isForgotPasswordOpen && TitleHelper.renderMetaHeader({
					title: Identify.__('Forgot Password')
				})}
				<div id="login-background" className={classes['login-background']}>
					{isForgotPasswordOpen &&
						<div className={`container ${classes['back-container']}`} id="back-container">
							<button className={`special-back ${classes['login-back']}`} id="btn-back"
								onClick={this.handleGoBack} >
								<span>{Identify.__('back').toUpperCase()}</span>
							</button>
						</div>}
					<div
						className={`container ${this.state.forgotPassSuccess == 'none'
							? classes['smallSize'] : ''} ${classes['login-container']}`}
					>
						<div
							className={`${isForgotPasswordOpen
								? classes['inactive'] : ''} ${classes['select-type']}`}
						>
							<button
								onClick={this.showEmailLoginForm}
								className={`${isEmailLogin ? classes['active'] : null} ${classes['signin-type']}`}
							>
								<div className={`${classes['wrap']} ${Identify.isRtl() ? classes['rtl-wrap'] : null}`} >
									{/* <span className={classes['icon-email']} /> */}
									<span className={classes['title-signin']}>{Identify.__('Sign In')}</span>
								</div>
							</button>
							<button
								onClick={this.setCreateAccountForm}
								className={`${isCreateAccountOpen ? classes['active'] : null} ${classes['register-type']}`}
							>
								<div className={`${classes['wrap']} ${Identify.isRtl() ? classes['rtl-wrap'] : null}`} >
									{/* <span className={classes['icon-phone']} /> */}
									<span className={classes['title-register']}>{Identify.__('Register')}</span>
								</div>
							</button>
						</div>
						{emailLoginForm}
						{createAccountForm}
						{forgotPasswordForm}
					</div>
				</div>
			</React.Fragment>
		);
	}
}

const mapStateToProps = ({ user }) => {
	const { currentUser, isSignedIn, forgotPassword } = user;
	const { firstname, email, lastname } = currentUser;

	return {
		email,
		firstname,
		forgotPassword,
		isSignedIn,
		lastname
	};
};

const mapDispatchToProps = {
	toggleMessages,
	simiSignedIn
};

export default compose(classify(defaultClasses), withRouter, connect(mapStateToProps, mapDispatchToProps))(Login);

async function setToken(token) {
	// TODO: Get correct token expire time from API
	return storage.setItem('signin_token', token, 3600);
}
