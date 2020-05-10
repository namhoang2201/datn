<?php

namespace Nam\RewardPoint\Model;

class Transactions extends \Magento\Framework\Model\AbstractModel
{

    protected function _construct()
    {
        $this->_init('Nam\RewardPoint\Model\ResourceModel\Transactions');
    }

}