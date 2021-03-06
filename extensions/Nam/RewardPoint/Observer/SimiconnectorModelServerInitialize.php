<?php

namespace Nam\RewardPoint\Observer;

use Magento\Framework\Event\ObserverInterface;

class SimiconnectorModelServerInitialize implements ObserverInterface {

    public $simiObjectManager;

    public function __construct(
        \Magento\Framework\ObjectManagerInterface $simiObjectManager
    ) {
        $this->simiObjectManager = $simiObjectManager;
    }
    /**
     * @param \Magento\Framework\Event\Observer $observer
     * @return $this
     */
    public function execute(\Magento\Framework\Event\Observer $observer) {
        $object = $observer->getObject();
        $data = $object->getData();
        $className = 'Nam\RewardPoint\Model\Api\\' . ucfirst($data['resource']);
        if (class_exists($className)) {
            $data['module'] = "rewardpoint";
            $object->setData($data);
        }
    }

}