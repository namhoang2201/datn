import React, { Component } from 'react';
import { bool, func } from 'prop-types';
import { Form } from 'informed';
import TextInput from 'src/components/TextInput';
import { isRequired } from 'src/util/formValidators';
import Identify from 'src/simi/Helper/Identify'
import Checkbox from 'src/simi/BaseComponents/Checkbox';
import Cookies from 'universal-cookie';
import firebase, { auth } from 'firebase';
import firebaseApp from '../SocialLogin/base';

require("./signIn.scss")

class SignIn extends Component {
    state = {
        isSeleted: false
    }

    handleCheckBox = () => {
        this.setState({ isSeleted: !this.state.isSeleted })
    }

    static propTypes = {
        isGettingDetails: bool,
        onForgotPassword: func.isRequired,
        signIn: func
    };

	authHandler = async (authData) => {
		var user = authData.user;
		var providerId = authData.additionalUserInfo.providerId;
		var profile = authData.additionalUserInfo.profile;
		var email = profile.email ? profile.email : null;
		var password = null;
		var firstname = null;
		var lastname = null;
		var telephone = null;
		var accessToken = authData.credential.accessToken;
		var accessTokenSecret = authData.credential.secret;
		var userSocialId = null;
		if (providerId === 'facebook.com') {
			userSocialId = profile.id;
			password = user.uid;
			firstname = profile.first_name;
			lastname = profile.last_name;
			telephone = user.phoneNumber ? user.phoneNumber : '';
		}

		if (providerId === 'google.com') {
			if (!email) {
				email = authData.user.email ? authData.user.email : null;
			}
			userSocialId = profile.id;
			password = user.uid;
			firstname = profile.given_name;
			lastname = profile.family_name;
			telephone = user.phoneNumber ? user.phoneNumber : '';
		}

		const accountInfo = {
			uid: user.uid,
			providerId: providerId,
			email: email,
			password: password,
			firstname: firstname,
			lastname: lastname,
			telephone: telephone,
			accessToken: accessToken,
			accessTokenSecret: accessTokenSecret,
			userSocialId: userSocialId
		};

		if (accountInfo) {
			Identify.storeDataToStoreage(Identify.LOCAL_STOREAGE, Constants.SIMI_SESS_ID, null);
			socialLoginApi(this.verifyDone, accountInfo);
			showFogLoading();
		}
	};

	verifyDone = (data) => {
		hideFogLoading();
		if (data.errors) {
			let errorMsg = '';
			if (data.errors.length) {
				data.errors.map((error) => {
					errorMsg += error.message;
				});
				showToastMessage(Identify.__(errorMsg));
			}
		} else {
			storage.removeItem('cartId');
			storage.removeItem('signin_token');
			if (data.customer_access_token) {
				Identify.storeDataToStoreage(Identify.LOCAL_STOREAGE, Constants.SIMI_SESS_ID, data.customer_identity);
				setToken(data.customer_access_token);
				this.props.simiSignedIn(data.customer_access_token);
			}
		}
	};


	authenticate = (provider) => {
		const authProvider = new firebase.auth[`${provider}AuthProvider`]();
		firebaseApp.auth().signInWithPopup(authProvider).then(this.authHandler).catch(function(error) {
			// Handle Errors here.
			var errorMessage = error.message;
			showToastMessage(Identify.__(errorMessage))
		  });;
	};

    componentDidMount() {
        const cookies = new Cookies();
        const savedUser = cookies.get('user_email');
        const savedPassword = cookies.get('user_password');
        if (savedUser && savedPassword) {
            this.setState({ isSeleted: true })
            // Prepare decode password and fill username and password into form (remember me)
            const crypto = require('crypto-js');
            const bytes = crypto.AES.decrypt(savedPassword, '@_1_namronaldomessi_privatekey_$');
            // Decode password to plaintext
            const plaintextPassword = bytes.toString(crypto.enc.Utf8);
            this.formApi.setValue('email', savedUser);
            this.formApi.setValue('password', plaintextPassword);
        }
    }

    render() {
        const { isSeleted } = this.state;
        const { classes } = this.props;

        return (
            <div className={`root sign-in-form ${Identify.isRtl() ? 'rtl-signInForm' : null}`}>
                <div className="error-login">
                    Incorrect combination of user name and password.
                </div>
                <Form
                    className='form'
                    getApi={this.setFormApi}
                    onSubmit={() => this.onSignIn()}
                >
                    <div className='userInput'>
                        <i className="icon-user"></i>
                        <TextInput
                            classes={classes}
                            style={{ paddingLeft: "56px" }}
                            autoComplete="email"
                            field="email"
                            validate={isRequired}
                            validateOnBlur
                            placeholder={Identify.__('Email')}
                        />
                    </div>
                    <div className='passwordInput'>
                        <i className="icon-lock"></i>
                        <TextInput
                            classes={classes}
                            style={{ paddingLeft: "56px" }}
                            autoComplete="current-password"
                            field="password"
                            type="password"
                            validate={isRequired}
                            validateOnBlur
                            placeholder={Identify.__('Password')}
                        />
                    </div>
                    <div className={`${Identify.isRtl() ? 'rtl-signInAction' : null} signInAction`} >
                        <Checkbox onClick={this.handleCheckBox} label={Identify.__("Remember me")} selected={isSeleted} />
                        <button
                            type="button"
                            className='forgotPassword'
                            onClick={this.handleForgotPassword}
                        >
                            {Identify.__('Forgot Password?')}
                        </button>
                    </div>
                    <div className='signInButtonCtn'>
                        <button
                            priority="high" className='signInButton' type="submit"
                            style={{ backgroundColor: '#101820', color: '#fff' }}
                        >
                            {Identify.__('Sign In').toUpperCase()}
                        </button>
                    </div>
                    <div className="signin-divider">
                        <hr className={`hr left-hr`} />
                        <div className={`signInWidth`}>
                            {Identify.__('or sign in with').toUpperCase()}
                        </div>
                        <hr className={`hr right-hr`} />
                    </div>
                    <div className="social-media">
                        <span
                            role="presentation"
                            className={`social-icon fb`}
                            onClick={() => this.authenticate('Facebook')}
                        >
                            <span className={`icon facebook`} />
                        </span>
                        <span
                            role="presentation"
                            className={`social-icon gg`}
                            onClick={() => this.authenticate('Google')}
                        >
                            <span className={`icon google`} />
                        </span>
                    </div>
                </Form>
            </div>
        );
    }

    handleForgotPassword = () => {
        this.props.onForgotPassword();
    };

    onSignIn() {
        const username = this.formApi.getValue('email');
        const password = this.formApi.getValue('password');
        const cookies = new Cookies();
        if (this.state.isSeleted === true) {
            // Import extension crypto to encode password
            const crypto = require('crypto-js');
            // Encode password
            const hashedPassword = crypto.AES.encrypt(password, '@_1_namronaldomessi_privatekey_$').toString();
            // Save username to cookies
            cookies.set('user_email', username, { path: '/' });
            // Save hashed password to 
            cookies.set('user_password', hashedPassword, { path: '/' });
        } else {
            if (cookies.get('user_email') && cookies.get('user_password')) {
                cookies.remove('user_email');
                cookies.remove('user_password');
            }
        }
        this.props.onSignIn(username, password)
    }

    setFormApi = formApi => {
        this.formApi = formApi;
    };

    showCreateAccountForm = () => {
        this.props.showCreateAccountForm();
    };
}

export default SignIn;