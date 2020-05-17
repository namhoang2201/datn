<?php
/**
 * Copyright © 2020 Namhoang. All rights reserved.
 */
namespace Nam\RewardPoint\Setup;

use Magento\Customer\Model\Customer;
use Magento\Customer\Setup\CustomerSetup;
use Magento\Framework\Setup\InstallDataInterface;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\ModuleDataSetupInterface;

class InstallData implements InstallDataInterface
{

    /**
     * Customer setup factory
     *
     * @var \Magento\Customer\Setup\CustomerSetupFactory
     */
    private $_customerSetupFactory;

    /**
     * Init
     *
     * @param \Magento\Customer\Setup\CustomerSetupFactory
     * $customerSetupFactory
     */
    public function __construct(
        \Magento\Customer\Setup\CustomerSetupFactory $customerSetupFactory
    ) {
        $this->_customerSetupFactory = $customerSetupFactory;
    }

    /**
     * Installs DB schema for a module
     *
     * @param ModuleDataSetupInterface $setup
     * @param ModuleContextInterface $context
     * @return void
     * @throws \Exception
     */
    public function install(
        ModuleDataSetupInterface $setup,
        ModuleContextInterface $context
    ) {
        $setup->startSetup();

        /** @var CustomerSetup $customerSetup */
        $customerSetup = $this->_customerSetupFactory->create([
            'setup' => $setup
        ]);

        $customerSetup->addAttribute(Customer::ENTITY, 'reward_point', [
            "type"     => "int",
            "backend"  => "",
            "label"    => "Current Balance Reward Point",
            "input"    => "text",
            "source"   => "",
            'global' => \Magento\Eav\Model\Entity\Attribute\ScopedAttributeInterface::SCOPE_GLOBAL,
            "visible"  => true,
            "required" => false,
            "default"  => 0,
            "frontend" => "",
            "unique"   => false,
            "note"     => ""
        ]);

        // add attribute to form
        /** @var  $attribute */
        $attribute = $customerSetup->getEavConfig()->getAttribute('customer',
            'reward_point');

        $usedinform[] = "adminhtml_customer";
        $usedinform[] = "customer_account_edit";
        $attribute->setData("used_in_forms", $usedinform)
            ->setData("is_used_for_customer_segment", true)
            ->setData("is_system", 0)
            ->setData("is_user_defined", 0)
            ->setData("is_visible", 1)
            ->setData("sort_order", 100);

        $attribute->save();

        $setup->endSetup();
    }
}