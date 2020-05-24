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

        $balance_point = $this->simiObjectManager->get('Magento\Customer\Model\Session')->getCustomer()->getRewardPoint();
        $subTotal = $this->_getCart()->getQuote()->getShippingAddress()->getSubtotal();
        // calculate amount discount
        $amount_discount_by_1_point = $this->simiObjectManager->get('Magento\Framework\App\Config\ScopeConfigInterface')
            ->getValue('rewardpoint/general/amount_spend');
        $maxDiscount = floatval($amount_discount_by_1_point) * $spendPoint;
        $quote = $this->_getCart()->getQuote();
        $useAllPoint = false;
        if ($maxDiscount <= $subTotal) {
            // case: use all point
            $quote->setNpPointUsing($spendPoint);
            $useAllPoint = true;
            $quote->save();
        } else {
            // case: use a mount point < blance point
            // find max_point < spendPoint and max_point * amount_discount_by_1_point > subTotal
            $max_point = 0;
            for ($i = 0; $i < $spendPoint; $i++) {
                if (floatval($amount_discount_by_1_point) * $i >= $subTotal) {
                    $max_point = $i;
                    break;
                }
            }
            if ($max_point > 0) {
                $quote->setNpPointUsing($max_point);
                $quote->save();
            }
        }
        $this->_getCart()->getQuote()->collectTotals()->save();

        $newestQuote = $this->_getCart()->getQuote();
        $newestGrandTotal = $newestQuote->getShippingAddress()->getGrandTotal();
        // calculate point_will_earn ->  save to quote
        $amount_earn_1_point = $this->simiObjectManager->get('Magento\Framework\App\Config\ScopeConfigInterface')
            ->getValue('rewardpoint/general/amount_earn');
        $numberPointWillEarn = 0;
        if($amount_earn_1_point > 0){
            $numberPointWillEarn = floor($newestGrandTotal / $amount_earn_1_point);
        }
        $newestQuote->setNpPointWillEarn($numberPointWillEarn);
        $newestQuote->save();
        if($useAllPoint){
            // all point <=> su dung het so point ma customer apply (khong co nghia la su dung het balance point )
            $message = 'You spend '.$spendPoint.' point(s) successfully !';
        }else{
            $message = 'You spend '.$max_point.' point(s) successfully !';
        }
        return $message;
    }
}
