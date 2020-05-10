<?php

namespace Nam\RewardPoint\Model\ResourceModel\Transactions\Grid;

use Magento\Framework\View\Element\UiComponent\DataProvider\SearchResult;

/**
 * Flat customer online grid collection
 *
 * @author      Magento Core Team <core@magentocommerce.com>
 */
class Collection extends SearchResult
{

    /**
     * @var string
     */
    protected $_idFieldName = 'transaction_id';
}
