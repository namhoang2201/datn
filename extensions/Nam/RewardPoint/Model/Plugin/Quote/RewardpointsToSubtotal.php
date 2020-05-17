<?php

namespace Nam\RewardPoint\Model\Plugin\Quote;

class RewardpointsToSubtotal
{

    public function afterGetSubtotalWithDiscount(\Magento\Sales\Block\Adminhtml\Order\Create\Items\Grid $grid, $result)
    {   $quote = $grid->getQuote();
        $objectManager = \Magento\Framework\App\ObjectManager::getInstance();
        $point_using = $quote->getNpPointUsing();
        $discount_by_1_point = $objectManager->get('Magento\Framework\App\Config\ScopeConfigInterface')
            ->getValue('rewardpoint/general/amount_spend');
        // calculate base_discount
        $baseDiscount = $point_using * floatval($discount_by_1_point);

        return $result + $baseDiscount;
    }

    public function afterGetDiscountAmount(\Magento\Sales\Block\Adminhtml\Order\Create\Items\Grid $grid, $result)
    {
        $quote = $grid->getQuote();
        $objectManager = \Magento\Framework\App\ObjectManager::getInstance();
        $point_using = $quote->getNpPointUsing();
        $discount_by_1_point = $objectManager->get('Magento\Framework\App\Config\ScopeConfigInterface')
            ->getValue('rewardpoint/general/amount_spend');
        // calculate base_discount
        $baseDiscount = $point_using * floatval($discount_by_1_point);
        return $result + $baseDiscount;
    }
}
