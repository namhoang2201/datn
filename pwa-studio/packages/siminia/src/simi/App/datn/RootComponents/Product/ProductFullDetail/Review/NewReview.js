import React from 'react';
import Identify from 'src/simi/Helper/Identify';
import { Whitebtn, Colorbtn } from 'src/simi/BaseComponents/Button';
import { SwipeableRate } from 'src/simi/App/datn/BaseComponents/Rate';
import { submitReview } from 'src/simi/Model/Product';
import { showFogLoading, hideFogLoading } from 'src/simi/BaseComponents/Loading/GlobalLoading';
import { simiSignedIn } from 'src/simi/Redux/actions/simiactions';
import { setToken } from 'src/actions/user';
import { showToastMessage } from 'src/simi/Helper/Message';
import { smoothScrollToView } from 'src/simi/Helper/Behavior';
import { compose } from 'redux';
import { connect } from 'src/drivers';
import { withRouter } from 'react-router-dom';
import Modal from 'src/simi/App/datn/BaseComponents/Modal';
import { validateEmail, validateEmpty } from 'src/simi/Helper/Validation';
import { configColor } from 'src/simi/Config';
import { Link } from 'src/drivers';
import { simiSignIn } from 'src/simi/Model/Customer';
import * as Constants from 'src/simi/Config/Constants';

require('./newReview.scss');
const $ = window.$;

const NewReview = props => {
    const { product, isSignedIn } = props;

    if (!product.simiExtraField || !product.simiExtraField.app_reviews || !product.simiExtraField.app_reviews.form_add_reviews || !product.simiExtraField.app_reviews.form_add_reviews.length)
        return ''

    const form_add_review = product.simiExtraField.app_reviews.form_add_reviews[0]
    const { rates } = form_add_review
    if (!rates)
        return ''

    const setData = (data) => {
        hideFogLoading()
        smoothScrollToView($('#root'))
        if (data.errors) {
            if (data.errors.length) {
                const errors = data.errors.map(error => {
                    return {
                        type: 'error',
                        message: error.message,
                        auto_dismiss: false
                    }
                })
                props.toggleMessages(errors)
            }
        } else {
            if (data.message && data.message) {
                props.toggleMessages([{
                    type: 'success',
                    message: Array.isArray(data.message) ? data.message[0] : data.message,
                    auto_dismiss: false
                }])
                $('#new-rv-nickname').val('')
                $('#new-rv-title').val('')
                $('#new-rv-detail').val('')
            }
        }
    }

    const handleSubmitReview = () => {
        // const nickname = $('#new-rv-nickname').val()
        const title = $('#new-rv-title').val()
        const detail = $('#new-rv-detail').val()
        const { isSignedIn, firstname, lastname } = props
        if (!isSignedIn) {
            // history.push({ pathname: '/login.html', pushTo: history.location.pathname })
            showPopupLogin();
            return
        }
        const nickname = lastname ? `${firstname} ${lastname}` : `${firstname}`;
        if (!nickname || !title || !detail) {
            showToastMessage(Identify.__('Please fill in all required fields'));
        } else {
            const params = {
                product_id: product.id,
                ratings: {},
                nickname,
                title,
                detail
            };
            const star = $('.select-star');
            for (let i = 0; i < star.length; i++) {
                const rate_key = $(star[i]).attr('data-key');
                const point = $(star[i]).attr('data-point');
                params.ratings[rate_key] = point;
            }
            showFogLoading()
            const submitRevRest = submitReview(setData, params);
        }
    }

    const showPopupLogin = () => {
        if ($('#review-require-login-popup').length) {
            $('#review-require-login-popup').show();
        }
    }

    const validateForm = (jQuery, form) => {
        let isAllow = true;
        const data = {};
        form.map((value, index) => {
            if (!validateEmpty(value.value)) {
                isAllow = false
                jQuery.find(`input[name="${value.name}"]`).closest('.item-form-control').next('.mage-error').text('This is a required field.')
            } else if (value.name === 'email' && !validateEmail(value.value)) {
                isAllow = false
                jQuery.find(`input[name="${value.name}"]`).closest('.item-form-control').next('.mage-error').text('Please enter a valid email address (Ex: johndoe@domain.com).')
            } else {
                jQuery.find(`input[name="${value.name}"]`).closest('.item-form-control').next('.mage-error').text('');
                if (value.name === 'email') {
                    data['username'] = value.value
                } else {
                    data[value.name] = value.value
                }
            }
        });
        return { isAllow, data }
    }

    const setDataLogin = (data) => {
        hideFogLoading();
        if (data && !data.errors) {
            const { simiSignedIn } = props;
            /* storage.removeItem('cartId');
            storage.removeItem('signin_token'); */
            if (data.customer_access_token) {
                Identify.storeDataToStoreage(Identify.LOCAL_STOREAGE, Constants.SIMI_SESS_ID, data.customer_identity)
                setToken(data.customer_access_token)
                simiSignedIn(data.customer_access_token)
            } else {
                setToken(data)
                simiSignedIn(data)
            }
        } else {
            showToastMessage(Identify.__('The account sign-in was incorrect or your account is disabled temporarily. Please wait and try again later.'))
        }
    }

    const handleSignIn = (e) => {
        e.preventDefault();
        const form = $(`.form-ck-popup-signin`);
        const formData = form.serializeArray();
        const isValidated = validateForm(form, formData);
        if (isValidated.isAllow) {
            simiSignIn(setDataLogin, isValidated.data);
            showFogLoading();
        }
    }

    const showModalRequireLogin = () => {
        return <Modal id="review-require-login-popup">
            <div className="ck-popup-main">
                <div className="confirm-ck-col">
                    <div className="confirm-ck-title">{Identify.__("Please sign in to SimiCart")}</div>
                    <div className="confirm-ck-desc">{Identify.__("Lorem Ipsum is simply dummy text of the printing and typesetting industry.")}</div>
                    <form className="form-ck-popup-signin" onSubmit={handleSignIn}>
                        <div className="form-control-pl">
                            <div className="item-form-control">
                                <span className="icon-user" />
                                <input type="email" placeholder={Identify.__("Email")} name="email" />
                            </div>
                            <div className="mage-error"></div>
                        </div>
                        <div className="form-control-pl">
                            <div className="item-form-control">
                                <span className="icon-lock" />
                                <input type="password" placeholder={Identify.__("Password")} name="password" />
                            </div>
                            <div className="mage-error"></div>
                        </div>
                        <Link className="popup-forgot-pw" to={{ pathname: '/login.html', state: { forgot: true } }}>{Identify.__("Forgot Password?")}</Link>
                        <Colorbtn type="submit" style={{ backgroundColor: configColor.button_background, color: configColor.button_text_color }} className="popup-signin-btn" text={Identify.__('Sign In')} />
                    </form>
                </div>
            </div>
        </Modal>
    }

    return (
        <div>
            <div className="review-form">
                <p className="your-rating-title">{Identify.__('Your Review')}</p>
                <div className="rate-table">
                    {rates.map((item, index) => {
                        return (
                            <div className="rate-item" key={index}>
                                <div className="rate-cell label-item">{Identify.__("Rate this item:")}</div>
                                <div className="rate-cell stars-item" id={item.rate_code}><SwipeableRate rate={1} size={24} rate_option={item.rate_options} rate_code={item.rate_code} change={true} /></div>
                            </div>
                        );
                    })}
                </div>
                <div className="form-content">
                    {/* <div className="form-group">
                        <p className="label-item">{Identify.__('Nickname')}<span className="rq">*</span></p>
                        <input type="text" id="new-rv-nickname" className="form-control" name="nickname" style={{background : '#f2f2f2'}} required placeholder={Identify.__('')}/>
                    </div> */}
                    <div className="form-group">
                        <p className="label-item">{Identify.__('Your review title:')}{/*<span className='rq'>*</span>*/}</p>
                        <input type="text" id="new-rv-title" className="form-control" name="title" style={{ background: '#f2f2f2' }} required placeholder={Identify.__('Please write your review title.')} />
                    </div>
                    <div className="form-group">
                        <p className="label-item">{Identify.__('Your review:')}{/*<span className="rq">*</span>*/}</p>
                        <textarea id="new-rv-detail" name="detail" className={`form-control`} rows="10" style={{ background: '#f2f2f2' }} placeholder={Identify.__('Please write your review.')}></textarea>
                    </div>
                    <div className="btn-submit-review-ctn">
                        <Whitebtn
                            text={Identify.__('Submit')}
                            className="btn-submit-review"
                            onClick={handleSubmitReview}
                        />
                    </div>
                    {!isSignedIn && showModalRequireLogin()}
                </div>
            </div>
        </div>
    )
}

const mapStateToProps = ({ user }) => {
    const { currentUser, isSignedIn } = user;
    const { firstname, lastname, id } = currentUser;

    return {
        isSignedIn,
        firstname,
        lastname,
        customerId: id
    };
}

const mapDispatchToProps = {
    simiSignedIn,
    setToken
};

export default compose(connect(mapStateToProps, mapDispatchToProps), withRouter)(NewReview);
