<?php

namespace Nam\RewardPoint\Observer;

use Magento\Framework\Event\ObserverInterface;

class NamSalesOrderSaveAfter implements ObserverInterface
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
     * NamSalesOrderSaveAfter constructor.
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
        $customerModel = $this->_customer->load($order->getCustomerId());
        $quoteModel = $objectManager->get('Magento\Quote\Model\Quote')->load($order->getQuoteId());

        // get amount discount by 1 point
        $discount_by_1_point = $objectManager->get('Magento\Framework\App\Config\ScopeConfigInterface')
            ->getValue('rewardpoint/general/amount_spend');
        // calculate base_discount
        $baseDiscount = intval($quoteModel->getNpPointUsing()) * floatval($discount_by_1_point);
        $pointEarn = intval($quoteModel->getNpPointWillEarn());
        $pointUse = intval($quoteModel->getNpPointUsing());

        // 1. Create transactions
        $transactionModel = $objectManager->create('Nam\RewardPoint\Model\Transactions');
        $transactionModel->setData([
            'np_order_id' => $order->getData('entity_id'),
            'point_before_transaction' => intval($customerModel->getRewardPoint()),
            'point_earn' => $pointEarn,
            'point_spend' => $pointUse,
            'total_before' => $quoteModel->getGrandTotal() - $baseDiscount,
            'discount_amount' => $baseDiscount,
            'total_after_discount' => $quoteModel->getGrandTotal(),
            'created_time' => date('Y-m-d H:i:s')
        ]);
        $transactionModel->save();

        // 2. Update point for customer
        $newBalancePoint = intval($customerModel->getRewardPoint()) + $pointEarn - $pointUse;
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

        // 4. Update order
        $order->setPointEarn($pointEarn);
        $order->setPointSpend($pointUse);
        $order->setNamrewardpointsDiscount($baseDiscount);
        $order->save();

        return $this;
    }
}