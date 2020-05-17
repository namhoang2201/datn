<?php

namespace Nam\Rewardpoint\Setup;

use Magento\Framework\Setup\InstallSchemaInterface;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\SchemaSetupInterface;
use Magento\Framework\DB\Ddl\Table;

class InstallSchema implements InstallSchemaInterface
{
    /**
     * Installs DB schema for a module
     *
     * @param SchemaSetupInterface $setup
     * @param ModuleContextInterface $context
     * @return void
     */
    public function install(SchemaSetupInterface $setup, ModuleContextInterface $context)
    {
        $installer = $setup;
        $installer->startSetup();

        /**
         * Drop tables if exists
         */
        $installer->getConnection()->dropTable($installer->getTable('namrewardpoint_transaction'));

        /**
         * Create table 'namrewardpoint_transaction'
         */
        $table = $installer->getConnection()
            ->newTable($installer->getTable('namrewardpoint_transaction'))
            ->addColumn(
                'transaction_id',
                Table::TYPE_INTEGER,
                null,
                ['identity' => true, 'nullable' => false, 'primary' => true, 'auto_increment' => true],
                'Transaction Id'
            )->addColumn(
                'np_order_id',
                Table::TYPE_INTEGER,
                null,
                ['unsigned' => true, 'nullable' => false, 'default' => '0'],
                'nam_rewardpoint_order_id reference to sale_order.order_id'
            )
            ->addColumn(
                'point_before_transaction',
                Table::TYPE_INTEGER,
                null,
                ['nullable' => true, 'default' => 0],
                'Points of customer before transaction'
            )->addColumn(
                'point_earn',
                Table::TYPE_INTEGER,
                null,
                ['nullable' => false, 'default' => 0],
                'Point amount that customer earned when create current transaction'
            )->addColumn(
                'point_spend',
                Table::TYPE_INTEGER,
                null,
                ['nullable' => true],
                'Point amount that customer spent when create current transaction'
            )->addColumn(
                'total_before',
                Table::TYPE_DECIMAL,
                '12,4',
                ['nullable' => false, 'default' => 0.00],
                'Grand total before discount'
            )->addColumn(
                'discount_amount',
                Table::TYPE_DECIMAL,
                '12,4',
                ['nullable' => true, 'default' => 0.00],
                'Discount amount when spent point'
            )->addColumn(
                'total_after_discount',
                Table::TYPE_DECIMAL,
                '12,4',
                ['nullable' => false, 'default' => 0.00],
                'Final Grand Total'
            )->addColumn(
                'created_time',
                Table::TYPE_DATETIME,
                null,
                [],
                'Time create transaction'
            )->addForeignKey(
                $installer->getFkName(
                    'namrewardpoint_transaction',
                    'np_order_id',
                    'sales_order',
                    'entity_id'
                ),
                'np_order_id',
                $installer->getTable('sales_order'),
                'entity_id',
                Table::ACTION_SET_DEFAULT
            );
        $installer->getConnection()->createTable($table);

        /**
         * Add 2 column 'earn_point', 'point_spend' to table  'sales_order'
         */
        $installer->getConnection()->addColumn(
            $installer->getTable('sales_order'),
            'point_earn',
            [
                'type' => Table::TYPE_INTEGER,
                'nullable' => true,
                'default' => 0,
                'comment' => 'Point amount that customer earned from current order'
            ]
        );
        $installer->getConnection()->addColumn(
            $installer->getTable('sales_order'),
            'point_spend',
            [
                'type' => Table::TYPE_INTEGER,
                'nullable' => true,
                'default' => 0,
                'comment' => 'Point amount that customer spent at current order'
            ]
        );
        $installer->getConnection()->addColumn(
            $installer->getTable('sales_order'),
            'namrewardpoints_discount',
            [
                'type' => Table::TYPE_DECIMAL,
                'length' => '12,4',
                'nullable' => true,
                'default' => 0.00,
                'comment' => 'Discount amount when spend point'
            ]
        );

        /**
         * Add 3 column to table 'quote'
         * 'point_using'
         * 'point_will_earn'
         */
        $installer->getConnection()->addColumn(
            $installer->getTable('quote'),
            'np_point_using',
            [
                'type' => Table::TYPE_INTEGER,
                'nullable' => true,
                'default' => 0,
                'comment' => 'Point amount that customer are spending before place order.'
            ]
        );
        $installer->getConnection()->addColumn(
            $installer->getTable('quote'),
            'np_point_will_earn',
            [
                'type' => Table::TYPE_INTEGER,
                'nullable' => true,
                'default' => 0,
                'comment' => 'Point amount that customer will earn after place order'
            ]
        );

        $installer->endSetup();
    }
}