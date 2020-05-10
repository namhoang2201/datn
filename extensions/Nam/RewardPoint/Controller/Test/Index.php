<?php
namespace Nam\RewardPoint\Controller\Test;

class Index extends \Magento\Framework\App\Action\Action
{
    protected $_pageFactory;

    protected $_transactionsFactory;

    public function __construct(
        \Magento\Framework\App\Action\Context $context,
        \Magento\Framework\View\Result\PageFactory $pageFactory,
        \Nam\RewardPoint\Model\TransactionsFactory $transactionsFactory
    )
    {
        $this->_pageFactory = $pageFactory;
        $this->_transactionsFactory = $transactionsFactory;
        return parent::__construct($context);
    }

    public function execute()
    {
        $transactions = $this->_transactionsFactory->create();
        $collection = $transactions->getCollection();
        foreach($collection as $item){
            echo "<pre>";
            print_r($item->getData());
            echo "</pre>";
        }
        exit();
        return $this->_pageFactory->create();
    }
}