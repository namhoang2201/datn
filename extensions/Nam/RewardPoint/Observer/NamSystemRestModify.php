<?php


namespace Nam\RewardPoint\Observer;

use Magento\Framework\Event\ObserverInterface;

class NamSystemRestModify implements ObserverInterface
{
    private $simiObjectManager;

    public function __construct(
        \Magento\Framework\ObjectManagerInterface $simiObjectManager
    )
    {
        $this->simiObjectManager = $simiObjectManager;
    }


    public function execute(\Magento\Framework\Event\Observer $observer)
    {
        $obj = $observer->getObject();
        $routeData = $observer->getData('routeData');
        $requestContent = $observer->getData('requestContent');
        $request = $observer->getData('request');
        $contentArray = $obj->getContentArray();
        if ($routeData && isset($routeData['routePath'])) {
            if (
                strpos($routeData['routePath'], 'V1/guest-carts/:cartId/payment-methods') !== false ||
                strpos($routeData['routePath'], 'V1/carts/mine/payment-methods') !== false ||
                strpos($routeData['routePath'], 'V1/guest-carts/:cartId/shipping-information') !== false ||
                strpos($routeData['routePath'], 'V1/carts/mine/shipping-information') !== false
            ) {
                if (isset($contentArray['payment_methods']) &&
                    (strpos($routeData['routePath'], 'V1/guest-carts/:cartId/shipping-information') !== false ||
                        strpos($routeData['routePath'], 'V1/carts/mine/shipping-information') !== false)) {
                    $this->_addDataToPayment($contentArray['payment_methods'], $routeData);
                } else {
                    $this->_addDataToPayment($contentArray, $routeData);
                }
                // if (isset($contentArray['totals']['items'])) {
                //     $totalData = $contentArray['totals'];
                //     $this->_addDataToQuoteItem($totalData);
                //     $contentArray['totals'] = $totalData;
                // }
            } else if (
                strpos($routeData['routePath'], 'V1/guest-carts/:cartId') !== false ||
                strpos($routeData['routePath'], 'V1/carts/mine') !== false
            ) {
                $this->_addDataToQuoteItem($contentArray, strpos($routeData['routePath'], 'totals') !== false);
            } else if (strpos($routeData['routePath'], 'integration/customer/token') !== false) {
                $this->_addCustomerIdentity($contentArray, $requestContent, $request);
            }
        }
        $obj->setContentArray($contentArray);
    }

    //modify payment api
    private function _addDataToPayment(&$contentArray, $routeData = false)
    {
        if (is_array($contentArray) && $routeData && isset($routeData['serviceClass'])) {
            $paymentHelper = $this->simiObjectManager->get('Simi\Simiconnector\Helper\Checkout\Payment');
            foreach ($paymentHelper->getMethods() as $method) {
                foreach ($contentArray as $index => $restPayment) {
                    if ($method->getCode() == $restPayment['code']) {
                        $restPayment['simi_payment_data'] = $paymentHelper->getDetailsPayment($method);
                    }
                    $contentArray[$index] = $restPayment;
                }
            }
        }
    }

    //modify quote item
    private function _addDataToQuoteItem(&$contentArray, $isTotal = false)
    {
        if (isset($contentArray['items']) && is_array($contentArray['items'])) {
            $stockRegistry = $this->simiObjectManager->create('Magento\CatalogInventory\Api\StockRegistryInterface');
            $quoteId = null;
            foreach ($contentArray['items'] as $index => $item) {
                $quoteItem = $this->simiObjectManager
                    ->get('Magento\Quote\Model\Quote\Item')->load($item['item_id']);
                if ($quoteItem->getId()) {
                    if (!$quoteId)
                        $quoteId = $quoteItem->getQuoteId();
                    if ($isTotal)
                        continue;
                    $product = $this->simiObjectManager
                        ->create('Magento\Catalog\Model\Product')
                        ->load($quoteItem->getData('product_id'));
                    $item['simi_image'] = $this->simiObjectManager
                        ->create('Simi\Simiconnector\Helper\Products')
                        ->getImageProduct($product);
                    $item['simi_sku'] = $product->getData('sku');
                    $item['url_key'] = $product->getData('url_key');
                    $item['name'] = $product->getName();

                    $parentProducts = $this->simiObjectManager
                        ->create('Magento\ConfigurableProduct\Model\ResourceModel\Product\Type\Configurable')
                        ->getParentIdsByChild($product->getId());
                    $imageProductModel = $product;
                    if ($parentProducts && isset($parentProducts[0])) {
                        $media_gallery = $imageProductModel->getMediaGallery();
                        $parentProductModel = $this->simiObjectManager->create('\Magento\Catalog\Model\Product')->load($parentProducts[0]);
                        if ($media_gallery && isset($media_gallery['images']) && is_array($media_gallery['images']) && !count($media_gallery['images'])) {
                            $imageProductModel = $parentProductModel;
                        }
                        $item['url_key'] = $parentProductModel->getData('url_key');
                    }
                    $item['image'] = $this->simiObjectManager
                        ->create('Simi\Simiconnector\Helper\Products')
                        ->getImageProduct($imageProductModel);
                    $stock = $stockRegistry->getStockItemBySku($product->getData('sku'))->getIsInStock();
                    $item['stock_status'] = $stock && $product->isSaleable();
                    $contentArray['items'][$index] = $item;
                }
            }
            if ($isTotal && $quoteId) {
                $contentArray['simi_quote_id'] = $quoteId;

                // get balance point of current customer show at cart detail
                $simiObjectManager = \Magento\Framework\App\ObjectManager::getInstance();
                $balance_point = $simiObjectManager->get('Magento\Customer\Model\Session')->getCustomer()->getRewardPoint();
                $contentArray['balance_rewardpoint'] = $balance_point;
                // get point using from quote table to apply to cart
                $quoteObject = $this->simiObjectManager->create('Magento\Quote\Model\Quote')
                    ->load($quoteId);
                $contentArray['np_point_using'] = $quoteObject->getData('np_point_using');
                // calculate point_will_earn ->  save to quote
                $grandTotal = $quoteObject->getGrandTotal();
                $amount_earn_1_point = $simiObjectManager->get('Magento\Framework\App\Config\ScopeConfigInterface')
                    ->getValue('rewardpoint/general/amount_earn');
                $numberPointWillEarn = 0;
                if($amount_earn_1_point > 0){
                    $numberPointWillEarn = floor($grandTotal / $amount_earn_1_point);
                }
                $quoteObject->setNpPointWillEarn($numberPointWillEarn);
                $quoteObject->save();
                $contentArray['np_point_will_earn'] = $numberPointWillEarn;

                try {
                    $quoteModel = $this->simiObjectManager->create('Magento\Quote\Model\Quote')
                        ->load($quoteId)->collectTotals();
                    if ($quoteMessages = $quoteModel->getMessages()) {
                        if (count($quoteMessages) > 0) {
                            $returnedMessages = array();
                            foreach ($quoteMessages as $quoteMessage) {
                                $returnedMessages[] = $quoteMessage->getText();
                            }
                            $contentArray['simi_quote_messages'] = $returnedMessages;
                        }
                    }
                    if ($quoteErrors = $quoteModel->getErrors()) {
                        if (count($quoteErrors) > 0) {
                            $returnedErrors = array();
                            foreach ($quoteErrors as $quoteError) {
                                $returnedErrors[] = $quoteError->getText();
                            }
                            $contentArray['simi_quote_errors'] = $returnedErrors;
                        }
                    }
                } catch (\Exception $e) {

                }
            }
        }
    }

    //add SessionId + simiHash to login api of system rest
    private function _addCustomerIdentity(&$contentArray, $requestContent, $request)
    {
        if (is_string($contentArray) && $request->getParam('getSessionId') && $requestContent['username']) {
            $storeManager = $this->simiObjectManager->get('\Magento\Store\Model\StoreManagerInterface');
            $requestCustomer = $this->simiObjectManager->get('Magento\Customer\Model\Customer')
                ->setWebsiteId($storeManager->getStore()->getWebsiteId())
                ->loadByEmail($requestContent['username']);
            $tokenCustomerId = $this->simiObjectManager->create('Magento\Integration\Model\Oauth\Token')
                ->loadByToken($contentArray)->getData('customer_id');
            if ($requestCustomer && $requestCustomer->getId() == $tokenCustomerId) {
                $this->simiObjectManager
                    ->get('Magento\Customer\Model\Session')
                    ->setCustomerAsLoggedIn($requestCustomer);
                $hash = $this->simiObjectManager
                    ->get('Simi\Simiconnector\Helper\Customer')
                    ->getToken(array());
                $contentArray = array(
                    'customer_access_token' => $contentArray,
                    'customer_identity' => $this->simiObjectManager
                        ->get('Magento\Customer\Model\Session')
                        ->getSessionId(),
                    'simi_hash' => $hash,
                );
            }
        }
    }
}