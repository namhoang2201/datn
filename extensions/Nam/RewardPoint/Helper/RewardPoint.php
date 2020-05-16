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
        $total              = $this->_getCart()->getQuote()->getShippingAddress()->getTotals();
        $return['discount'] = 0;
        if (isset($total['discount']) && $total['discount']->getValue()) {
            $return['discount'] = abs($total['discount']->getValue());
        }

        return '';
    }
}
