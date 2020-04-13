<?php

namespace Simi\Simiconnector\Model;

use Magento\Customer\Api\AccountManagementInterface;
use Magento\Customer\Model\AccountManagement;
use Magento\Framework\Stdlib\Cookie\CookieMetadataFactory;
use Magento\Framework\Stdlib\Cookie\PhpCookieManager;
use Hybrid_Auth;

use function PHPSTORM_META\type;

/**
 * Simiconnector Model
 *
 * @method \Simi\Simiconnector\Model\ResourceModel\Page _getResource()
 * @method \Simi\Simiconnector\Model\ResourceModel\Page getResource()
 */
class Customer extends \Magento\Framework\Model\AbstractModel
{

    public $simiObjectManager;
    public $storeManager;
    public $cookieMetadataFactory;
    public $cookieMetadataManager;

    public function __construct(
        \Magento\Framework\Model\Context $context,
        \Magento\Framework\ObjectManagerInterface $simiObjectManager,
        \Magento\Framework\Registry $registry,
        \Magento\Framework\Model\ResourceModel\AbstractResource $resource = null,
        \Magento\Framework\Data\Collection\AbstractDb $resourceCollection = null,
        array $data = []
    ) {

        $this->simiObjectManager = $simiObjectManager;
        $this->storeManager     = $this->simiObjectManager->get('Magento\Store\Model\StoreManagerInterface');
        parent::__construct($context, $registry, $resource, $resourceCollection, $data);
    }

    public function reindexCustomerGrid() {
        $indexerFactory = $this->simiObjectManager->get('Magento\Indexer\Model\IndexerFactory');
        $indexerIds = array(
            'customer_grid',
        );
        foreach ($indexerIds as $indexerId) {
            $indexer = $indexerFactory->create();
            $indexer->load($indexerId);
            $indexer->reindexAll();
        }
    }

    public function _helperCustomer()
    {
        return $this->simiObjectManager->get('Simi\Simiconnector\Helper\Customer');
    }

    public function _getSession()
    {
        return $this->simiObjectManager->get('Magento\Customer\Model\Session');
    }

    public function getCustomerByEmail($email)
    {
        return $this->_helperCustomer()->getCustomerByEmail($email);
    }

    public function getAccountManagement()
    {
        return $this->simiObjectManager->get('Magento\Customer\Api\AccountManagementInterface');
    }

    public function forgetPassword($data)
    {
        $data  = $data['params'];
        $email = $data['email'];
        if ($email === null) {
            throw new \Simi\Simiconnector\Helper\SimiException(__('No email was sent'), 4);
        } else {
            if (!\Zend_Validate::is($email, 'EmailAddress')) {
                $this->_getSession()->setForgottenEmail($email);
                throw new \Simi\Simiconnector\Helper\SimiException(__('Please correct the email address.'), 4);
            }
            $customer = $this->_helperCustomer()->getCustomerByEmail($email);
            if ($customer->getId()) {
                $this->getAccountManagement()->initiatePasswordReset(
                    $email,
                    AccountManagement::EMAIL_RESET
                );
            } else {
                throw new \Simi\Simiconnector\Helper\SimiException(__('Customer is not exist'));
            }
        }
    }

    public function login($data)
    {
        return $this->simiObjectManager->get('Simi\Simiconnector\Helper\Customer')
                ->loginByEmailAndPass($data['params']['email'], $data['params']['password']);
    }

    public function logout()
    {
        $lastCustomerId = $this->_getSession()->getId();
        $this->_getSession()->logout()->setBeforeAuthUrl($this->simiObjectManager
                ->get('Magento\Framework\UrlInterface')->getUrl())
                ->setLastCustomerId($lastCustomerId);
        if ($this->getCookieManager()->getCookie('mage-cache-sessid')) {
            $metadata = $this->getCookieMetadataFactory()->createCookieMetadata();
            $metadata->setPath('/');
            $this->getCookieManager()->deleteCookie('mage-cache-sessid', $metadata);
        }
        return true;
    }

    public function register($data)
    {
        $data          = $data['contents'];
        $message       = [];
        $checkCustomer = $this->getCustomerByEmail($data->email);
        if ($checkCustomer->getId()) {
            throw new \Simi\Simiconnector\Helper\SimiException(__('Account is already exist'), 4);
        }
        $customer = $this->_createCustomer($data);
        try {
            $this->reindexCustomerGrid();
        } catch (\Exception $e) {

        }
        $confirmationStatus = $this->getAccountManagement()->getConfirmationStatus($customer->getId());
        if ($confirmationStatus === \Magento\Customer\Api\AccountManagementInterface::ACCOUNT_CONFIRMATION_REQUIRED) {
            throw new \Simi\Simiconnector\Helper\SimiException(__('Account confirmation is required. '
                . 'Please, check your email.'), 4);
        }
        return $customer;
    }

    public function updateProfile($data)
    {
        $data     = $data['contents'];
        $result   = [];

        $customer = $this->simiObjectManager->create('Magento\Customer\Model\Customer');
        $customer->setWebsiteId($this->storeManager->getStore()->getWebsiteId());
        $customer->loadByEmail($data->email);

        $customerData = [
            'firstname' => $data->firstname,
            'lastname'  => $data->lastname,
            'email'     => $data->email,
        ];

        if (isset($data->change_password) && $data->change_password == 1) {
            $currPass = $data->old_password;
            $newPass  = $data->new_password;
            $confPass = $data->com_password;
            $customer->setChangePassword(1);
            if ($customer->authenticate($data->email, $currPass)) {
                if ($newPass != $confPass) {
                    throw new \Magento\Framework\Exception\InputException(
                        __('Password confirmation doesn\'t match entered password.')
                    );
                }
                $customer->setPassword($newPass);
                $customer->setConfirmation($confPass);
                $customer->setPasswordConfirmation($confPass);
            }
        }
        $this->setCustomerData($customer, $data);
        $customerForm   = $this->simiObjectManager->get('Magento\Customer\Model\Form');
        $customerForm->setFormCode('customer_account_edit')
                ->setEntity($customer);
        $customerErrors = $customerForm->validateData($customer->getData());
        if ($customerErrors !== true) {
            if (is_array($customerErrors)) {
                throw new \Simi\Simiconnector\Helper\SimiException($customerErrors[0], 4);
            } else {
                throw new \Simi\Simiconnector\Helper\SimiException($customerErrors, 4);
            }
        } else {
            $customerForm->compactData($customerData);
        }

        if (is_array($customerErrors)) {
            throw new \Simi\Simiconnector\Helper\SimiException(__('Invalid profile information'), 4);
        }
        $customer->setConfirmation(null);
        $customer->save();
        $this->_getSession()->setCustomer($customer);
        return $customer;
    }

    private function setCustomerData($customer, $data)
    {
        if (isset($data->taxvat)) {
            $customer->setTaxvat($data->taxvat);
        }
        if (isset($data->day) && $data->day != "") {
            $birthday = $data->year . "-" . $data->month . "-" . $data->day;
            $customer->setDob($birthday);
        }
        if (isset($data->gender) && $data->gender) {
            $customer->setGender($data->gender);
        }
        if (isset($data->prefix) && $data->prefix) {
            $customer->setPrefix($data->prefix);
        }
        if (isset($data->middlename) && $data->middlename) {
            $customer->setMiddlename($data->middlename);
        }
        if (isset($data->suffix) && $data->suffix) {
            $customer->setSuffix($data->suffix);
        }
    }

    /*
     * Social Login
     * @param
     * $data - Object with at least:
     * $data->firstname
     * $data->lastname
     * $data->email
     */

    public function socialLogin($data)
    {
        $data = (object) $data['contents'];

        if (!$data->email) {
            throw new \Simi\Simiconnector\Helper\SimiException(__('Cannot Get Your Email. Please let your application provide an email to login.'), 4);
        }
        $customer = $this->simiObjectManager
            ->get('Simi\Simiconnector\Helper\Customer')->getCustomerByEmail($data->email);

        if ($customer->getId()) {
            // If exist account with that email, check confirmation
            if ($customer->getConfirmation()) {
                throw new \Simi\Simiconnector\Helper\SimiException(__('This account is not confirmed. Verify and try again.'), 4);
            }
            //Check authenticate with facebook, google or twitter
            // Only twitter need accessTokenSecret
            if (isset($data->providerId) && isset($data->accessToken)) {
                switch ($data->providerId) {
                    case "facebook.com":
                        try {
                            $fbId = $this->simiObjectManager->get('Magento\Framework\App\Config\ScopeConfigInterface')->getValue('simiconnector/social_login/facebook_id');
                            $fbSecret = $this->simiObjectManager->get('Magento\Framework\App\Config\ScopeConfigInterface')->getValue('simiconnector/social_login/facebook_secret');
                            if ($fbId && $fbSecret) {
                                $config = [
                                    'callback'  => \Hybridauth\HttpClient\Util::getCurrentUrl(),
                                    'keys' => ['id' => $fbId, 'secret' => $fbSecret],
                                    'endpoints' => [
                                        'api_base_url'     => 'https://graph.facebook.com/v2.12/',
                                        'authorize_url'    => 'https://www.facebook.com/dialog/oauth',
                                        'access_token_url' => 'https://graph.facebook.com/oauth/access_token',
                                    ]
                                ];
                                $adapter = new \Hybridauth\Provider\Facebook($config);

                                $adapter->setAccessToken(['access_token' => $data->accessToken]);

                                $userProfile = $adapter->getUserProfile();

                                $adapter->disconnect();
                            } else {
                                throw new \Simi\Simiconnector\Helper\SimiException(__('Administrator need configure social login !'), 4);
                            }
                        } catch (\Exception $e) {
                            throw new \Simi\Simiconnector\Helper\SimiException(__($e->getMessage()), 4);
                        }
                        break;
                    case "google.com":
                        try {
                            $googleId = $this->simiObjectManager->get('Magento\Framework\App\Config\ScopeConfigInterface')->getValue('simiconnector/social_login/google_id');
                            $googleSecret = $this->simiObjectManager->get('Magento\Framework\App\Config\ScopeConfigInterface')->getValue('simiconnector/social_login/google_secret');
                            if ($googleId && $googleSecret) {
                                $config = [
                                    'callback'  => \Hybridauth\HttpClient\Util::getCurrentUrl(),
                                    'keys' => ['id' => $googleId, 'secret' => $googleSecret]
                                ];

                                $adapter = new \Hybridauth\Provider\Google($config);

                                $adapter->setAccessToken(['access_token' => $data->accessToken]);

                                $userProfile = $adapter->getUserProfile();

                                $adapter->disconnect();
                            } else {
                                throw new \Simi\Simiconnector\Helper\SimiException(__('Administrator need configure social login !'), 4);
                            }
                        } catch (\Exception $e) {
                            throw new \Simi\Simiconnector\Helper\SimiException(__($e->getMessage()), 4);
                        }
                        break;
                }

                // Check if exist response from facebook, google
                if ($userProfile && $userProfile->identifier) {
                    // Check if above identifier the same as the identifier returned by pwa studio
                    if ($userProfile->identifier === $data->userSocialId) {
                        // If the same -> force login ( need return 2 fields: customer_access_token and customer_identity)

                        // Login by customer object, this function only create new customer session id ( customer_identity)
                        $this->simiObjectManager
                            ->get('Simi\Simiconnector\Helper\Customer')->loginByCustomer($customer);
                        // Create new customer access token ( customer_access_token )
                        $tokenModel = $this->simiObjectManager->create('\Magento\Integration\Model\Oauth\Token');
                        $tokenModel->createCustomerToken($customer->getId());
                    } else {
                        // Not the same, show error
                        throw new \Simi\Simiconnector\Helper\SimiException(__('Your account is Invalid !'), 4);
                    }
                } else {
                    throw new \Simi\Simiconnector\Helper\SimiException(__('Your account is not authenticated by ' . $data->providerId . ' !'), 4);
                }
            } else {
                throw new \Simi\Simiconnector\Helper\SimiException(__('Invalid login !'), 4);
            }
        } else {
            if (!$data->firstname) {
                $data->firstname = __('Firstname');
            }
            if (!$data->lastname) {
                $data->lastname = __('Lastname');
            }
            // Create new customer account for social network
            $customer = $this->_createCustomer($data);
            // Notify user to check mailbox and verify new account
            throw new \Simi\Simiconnector\Helper\SimiException(__('Please check your mailbox to active your account !.'), 4);
        }
    }

    /*
     * Create Customer
     * @param
     * $data - Object with at least:
     * $data->firstname
     * $data->lastname
     * $data->email
     * $data->password
     */

    public function _createCustomer($data)
    {
        $customer = $this->simiObjectManager->create('Magento\Customer\Api\Data\CustomerInterface')
            ->setFirstname($data->firstname)
            ->setLastname($data->lastname)
            ->setEmail($data->email);
        $this->simiObjectManager->get('Simi\Simiconnector\Helper\Customer')->applyDataToCustomer($customer, $data);

        $password = null;
        if (isset($data->password) && $data->password) {
            $password = $data->password;
        }
        $customer = $this->getAccountManagement()->createAccount($customer,$password,'');
        $subscriberFactory = $this->simiObjectManager->get('Magento\Newsletter\Model\SubscriberFactory');
        if (isset($data->news_letter) && ($data->news_letter == '1')) {
            $subscriberFactory->create()->subscribeCustomerById($customer->getId());
        } else {
            $subscriberFactory->create()->unsubscribeCustomerById($customer->getId());
        }
        $customer = $this->simiObjectManager->create('Magento\Customer\Model\Customer')->load($customer->getId());
        return $customer;
    }

    private function getCookieManager()
    {
        if (!$this->cookieMetadataManager) {
            $this->cookieMetadataManager = $this->simiObjectManager->get(PhpCookieManager::class);
        }
        return $this->cookieMetadataManager;
    }

    private function getCookieMetadataFactory()
    {
        if (!$this->cookieMetadataFactory) {
            $this->cookieMetadataFactory = $this->simiObjectManager->get(CookieMetadataFactory::class);
        }
        return $this->cookieMetadataFactory;
    }
}
