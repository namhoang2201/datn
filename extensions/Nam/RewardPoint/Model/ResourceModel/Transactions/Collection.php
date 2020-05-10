<?php

namespace Nam\RewardPoint\Model\ResourceModel\Transactions;

class Collection extends \Magento\Framework\Model\ResourceModel\Db\Collection\AbstractCollection
{
    protected $_idFieldName = 'transaction_id';

    /**
     * Define resource model
     *
     * @return void
     */
    protected function _construct()
    {
        $this->_init('Nam\RewardPoint\Model\Transactions', 'Nam\RewardPoint\Model\ResourceModel\Transactions');
    }

}
