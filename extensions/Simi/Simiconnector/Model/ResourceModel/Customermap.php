<?php

namespace Simi\Simiconnector\Model\ResourceModel;

use Magento\Framework\Model\ResourceModel\Db\AbstractDb;

/**
 * Connector Resource Model
 */
class Customermap extends AbstractDb
{

    /**
     * Initialize resource model
     *
     * @return void
     */
    public function _construct()
    {
        $this->_init('simipwa_social_customer_mapping', 'id');
    }
}
