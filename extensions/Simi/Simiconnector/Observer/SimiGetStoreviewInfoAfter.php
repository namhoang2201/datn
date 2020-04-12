<?php

namespace Simi\Simiconnector\Observer;

use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\UrlInterface;

class SimiGetStoreviewInfoAfter implements ObserverInterface {
    public $simiObjectManager;
    protected $_attributeFactory;
    protected $eavConfig;
    protected $storeManager;
    protected $swatchMediaHelper;

    /**
     * @var \Magento\Framework\App\Config\ScopeConfigInterface
     */
    protected $config;

    /**
     * @var UrlInterface
     */
    private $urlBuilder;

    public function __construct(
        \Magento\Framework\ObjectManagerInterface $simiObjectManager,
        \Magento\Framework\App\Config\ScopeConfigInterface $config,
        \Magento\Catalog\Model\ResourceModel\Eav\Attribute $attributeFactory,
        \Magento\Eav\Model\Config $eavConfig,
        \Magento\Store\Model\StoreManagerInterface $storeManager,
        \Magento\Swatches\Helper\Media $swatchMediaHelper,
        UrlInterface $urlBuilder
    ) {
        $this->simiObjectManager = $simiObjectManager;
        $this->config = $config;
        $this->_attributeFactory = $attributeFactory;
        $this->eavConfig = $eavConfig;
        $this->storeManager = $storeManager;
        $this->swatchMediaHelper = $swatchMediaHelper;
        $this->urlBuilder = $urlBuilder;
    }

    public function execute(\Magento\Framework\Event\Observer $observer) {
        $object = $observer->getEvent()->getData('object');
        if ($object->storeviewInfo) {
            // Nam customize firebase config
            $object->storeviewInfo['social_login_config'] = array(
                'firebase_config' => $this->config->getValue('simiconnector/firebase/firebase_config')
            );
        }
    }
}