<?php

/**
 * RewardPoint helper
 */

namespace Nam\RewardPoint\Helper;

class RewardPoint extends \Simi\Simiconnector\Helper\Data
{

    public function _getCart()
    {
        return $this->simiObjectManager->get('Magento\Checkout\Model\Cart');
    }

    public function spendPoint($spendPoint)
    {
        $this->_getCart()->getQuote()->getShippingAddress()->setCollectShippingRates(true);
        $this->_getCart()->getQuote()->collectTotals()->save();
        $balance_point = $this->simiObjectManager->get('Magento\Customer\Model\Session')->getCustomer()->getRewardPoint();
        $grandTotal              = $this->_getCart()->getQuote()->getShippingAddress()->getGrandTotal();
        echo $grandTotal; die();
        if($spendPoint > $balance_point){
            $message = 'You can not spend a numbers of points greater than your balance points !';
        }

        return $message;
    }
}
