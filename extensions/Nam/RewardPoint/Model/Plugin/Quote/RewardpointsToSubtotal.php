<?php

namespace Nam\RewardPoint\Model\Plugin\Quote;

class RewardpointsToSubtotal
{

    public function afterGetSubtotalWithDiscount(\Magento\Sales\Block\Adminhtml\Order\Create\Items\Grid $grid, $result)
    {
        $quote = $grid->getQuote();
        return $result + $quote->getNamrewardpointDiscountAmount();
    }

    public function afterGetDiscountAmount(\Magento\Sales\Block\Adminhtml\Order\Create\Items\Grid $grid, $result)
    {
        $quote = $grid->getQuote();
        return $result + $quote->getNamrewardpointDiscountAmount();
    }
}
