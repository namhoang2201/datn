<?php

namespace Nam\RewardPoint\Observer;

use Magento\Framework\Event\ObserverInterface;

class SalesOrderSaveAfter implements ObserverInterface
{

    /**
     * Store manager
     *
     * @var \Magento\Customer\Model\Customer
     */
    protected $_customer;

    /**
     * Request
     *
     * @var \Magento\Framework\App\RequestInterface
     */
    protected $_request;

    /**
     * SalesOrderSaveAfter constructor.
     * @param \Magento\Framework\App\RequestInterface $request
     * @param \Magento\Customer\Model\Customer $customer
     */
    public function __construct(
        \Magento\Framework\App\RequestInterface $request,
        \Magento\Customer\Model\Customer $customer
    )
    {
        $this->_request = $request;
        $this->_customer = $customer;
    }

    /**
     * Create transactions
     * Add point for customer
     * Update point at quote table
     * @param \Magento\Framework\Event\Observer $observer
     * @return $this
     */
    public function execute(\Magento\Framework\Event\Observer $observer)
    {

        $order = $observer['order'];
        if ($order->getCustomerIsGuest() || !$order->getCustomerId()) {
            return $this;
        }
        $objectManager = \Magento\Framework\App\ObjectManager::getInstance();
        $transactionModel = $objectManager->create('\Nam\RewardPoint\Model\Transactions');
        $customerModel = $objectManager->get('\Magento\Customer\Model\Session')->getCustomer();
//        $quoteModel = $objectManager->get('\Magento\Checkout\Model\Session')->getQuote();
        $quoteModel = $objectManager->get('Magento\Checkout\Model\Cart')->getQuote();

        // get amount discount by 1 point
        $discount_by_1_point = $objectManager->get('Magento\Framework\App\Config\ScopeConfigInterface')
            ->getValue('rewardpoint/general/amount_spend');
        // calculate base_discount
        $baseDiscount = $quoteModel->getNpPointUsing() * floatval($discount_by_1_point);

        // 1. Create transactions
        $transactionModel->setData([
            'np_order_id' => $order->getData('entity_id'),
            'point_before_transaction' => $customerModel->getRewardPoint(),
            'point_earn' => $quoteModel->getNpPointWillEarn(),
            'point_spend' => $quoteModel->getNpPointUsing(),
            'total_before' => $quoteModel->getGrandTotal() - $baseDiscount,
            'discount_amount' => $baseDiscount,
            'total_after_discount' => $quoteModel->getGrandTotal(),
            'created_time' => date('Y-m-d H:i:s')
        ]);
        $transactionModel->save();

        // 2. Update point for customer
        $newBalancePoint = $customerModel->getRewardPoint() + $quoteModel->getNpPointWillEarn() - $quoteModel->getNpPointUsing();
        if ($newBalancePoint < 0) {
            $customerModel->setRewardPoint(0);
        } else {
            $customerModel->setRewardPoint($newBalancePoint);
        }
        $customerModel->save();

        // 3. Update point at quote table (np_point_using, np_point_will_earn )
        $quoteModel->setNpPointWillEarn(0);
        $quoteModel->setNpPointUsing(0);
        $quoteModel->save();

        return $this;
    }
}