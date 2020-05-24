<?php

namespace Nam\RewardPoint\Model\Total\Quote;

/**
 * Class Custom
 * @package Meetanshi\HelloWorld\Model\Total\Quote
 */
class Point extends \Magento\Quote\Model\Quote\Address\Total\AbstractTotal
{
    /**
     * @var \Magento\Framework\Pricing\PriceCurrencyInterface
     */
    protected $_priceCurrency;

    /**
     * Custom constructor.
     * @param \Magento\Framework\Pricing\PriceCurrencyInterface $priceCurrency
     */
    public function __construct(\Magento\Framework\Pricing\PriceCurrencyInterface $priceCurrency)
    {
        $this->_priceCurrency = $priceCurrency;
        $this->setCode('nam_rewardpoint_discount');
    }

    /**
     * @param \Magento\Quote\Model\Quote $quote
     * @param \Magento\Quote\Api\Data\ShippingAssignmentInterface $shippingAssignment
     * @param \Magento\Quote\Model\Quote\Address\Total $total
     * @return $this|bool
     */
    public function collect(\Magento\Quote\Model\Quote $quote, \Magento\Quote\Api\Data\ShippingAssignmentInterface $shippingAssignment, \Magento\Quote\Model\Quote\Address\Total $total)
    {
        parent::collect($quote, $shippingAssignment, $total);
//        $baseDiscount = 5;
        // get point_using ( customer spend point ) from quote table
        $point_using = $quote->getNpPointUsing();
        // get amount discount by 1 point
        $objectManager = \Magento\Framework\App\ObjectManager::getInstance();
        $discount_by_1_point = $objectManager->get('Magento\Framework\App\Config\ScopeConfigInterface')
            ->getValue('rewardpoint/general/amount_spend');
        // calculate base_discount
        $baseDiscount = $point_using * floatval($discount_by_1_point);

        $discount = $this->_priceCurrency->convert($baseDiscount);
        $total->addTotalAmount('nam_rewardpoint_discount', -$discount);
        $total->addBaseTotalAmount('nam_rewardpoint_discount', -$baseDiscount);
        if($total->getBaseGrandTotal() - $baseDiscount <= 0){
            $total->setBaseGrandTotal(0);
        }else{
            $total->setBaseGrandTotal($total->getBaseGrandTotal() - $baseDiscount);
        }
        $quote->setCustomDiscount(-$discount);
        return $this;
    }

    /**
     * @param \Magento\Quote\Model\Quote $quote
     * @param \Magento\Quote\Model\Quote\Address\Total $total
     * @return array
     */
    public function fetch(
        \Magento\Quote\Model\Quote  $quote,
        \Magento\Quote\Model\Quote\Address\Total $total
    ) {
        // get point_using ( customer spend point ) from quote table
        $point_using = $quote->getNpPointUsing();
        // get amount discount by 1 point
        $objectManager = \Magento\Framework\App\ObjectManager::getInstance();
        $discount_by_1_point = $objectManager->get('Magento\Framework\App\Config\ScopeConfigInterface')
            ->getValue('rewardpoint/general/amount_spend');
        // calculate base_discount
        $baseDiscount = $point_using * floatval($discount_by_1_point);
        return [
            'code' => $this->getCode(),
            'title' => $this->getLabel(),
            'value' => -$baseDiscount
        ];

   }
   /**
    * @return \Magento\Framework\Phrase
    */
   public function getLabel()
   {
       return __('Nam RewardPoint Discount');
   }
}