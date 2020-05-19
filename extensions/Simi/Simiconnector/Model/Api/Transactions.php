<?php

namespace Simi\Simiconnector\Model\Api;

class Transactions extends \Simi\Simiconnector\Model\Api\Apiabstract
{

    public function setBuilderQuery()
    {
        $data = $this->getData();
        if ($data['resourceid']) {
            $this->builderQuery = $this->simiObjectManager
                ->get('Nam\RewardPoint\Model\Transactions')->load($data['resourceid']);
        } else {
            $this->builderQuery = $this->getCollection();
        }
    }

    public function getCollection()
    {
        $data = $this->getData();
        $parameters = $data['params'];
        $email = null;
        if(isset($parameters['email'])){
            $email = $parameters['email'];
        }
        $transactionsCollection = $this->simiObjectManager
            ->get('Nam\RewardPoint\Model\Transactions')->getCollection()->addFieldToFilter('email', $email);

        $transactionsCollection->setOrder('created_time', 'DESC')->load();

        $this->builderQuery = $transactionsCollection;

        return $transactionsCollection;
    }
    public function index()
    {
        $result = parent::index();

        // return blance point customer in api result
        $simiObjectManager = \Magento\Framework\App\ObjectManager::getInstance();
        $balance_point = $simiObjectManager->get('Magento\Customer\Model\Session')->getCustomer()->getData('reward_point');
        $result['balance_point'] = intval($balance_point);

        return $result;
    }

}