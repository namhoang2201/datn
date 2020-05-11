<?php

/**
 * Namrewardpoints Total Label Block
 *
 * @category    Nam
 * @package     Nam_RewardPoint
 * @author      Nam Developer
 */

namespace Nam\RewardPoint\Block\Totals\Order;

class Point extends \Magento\Sales\Block\Order\Totals
{

    /**
     * Point constructor.
     * @param \Magento\Framework\View\Element\Template\Context $context
     * @param \Magento\Framework\Registry $registry
     * @param array $data
     */
    public function __construct(
        \Magento\Framework\View\Element\Template\Context $context,
        \Magento\Framework\Registry $registry,
        array $data = []
    )
    {
        $this->_coreRegistry = $registry;
        parent::__construct($context, $registry, $data);
    }

    /**
     * add points label into order total
     *
     */
    public function initTotals()
    {
        $totalsBlock = $this->getParentBlock();
        $order = $totalsBlock->getOrder();
        $totalsBlock->addTotal(new \Magento\Framework\DataObject([
            'code' => 'namrewardpoints_earn_label',
            'label' => __('(Nam_RP) Earn Points'),
            'value' => $order->getPointEarn() . ' Point(s)',
            'area' => 'footer',
            'is_formated' => true,
        ]), 'subtotal');

        $totalsBlock->addTotal(new \Magento\Framework\DataObject([
            'code' => 'namrewardpoints_spent_label',
            'label' => __('(Nam_RP) Spend Points'),
            'value' => $order->getPointSpend() . ' Point(s)',
            'area' => 'footer',
            'is_formated' => true,
        ]), 'namrewardpoints_earn_label');

        $totalsBlock->addTotal(new \Magento\Framework\DataObject([
            'code' => 'namrewardpoints',
            'label' => __('(Nam_RP) Discount amount when spend point'),
            'value' => -$order->getNamrewardpointsDiscount(),
            'area' => 'footer',
        ]), 'namrewardpoints_spent_label');
    }
}
