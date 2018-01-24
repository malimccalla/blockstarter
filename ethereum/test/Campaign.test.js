const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const comipledFactory = require('../build/CampaignFactory.json');
const comipledCampaign = require('../build/Campaign.json');

const provider = ganache.provider();
const web3 = new Web3(provider);

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(JSON.parse(comipledFactory.interface))
    .deploy({ data: comipledFactory.bytecode })
    .send({ from: accounts[0], gas: '1000000' });

  factory.setProvider(provider);
  await factory.methods.createCampaign('100').send({
    from: accounts[1],
    gas: '1000000',
  });

  [campaignAddress] = await factory.methods.getCampaigns().call();

  campaign = await new web3.eth.Contract(
    JSON.parse(comipledCampaign.interface),
    campaignAddress
  );

  campaign.setProvider(provider);
});

describe('Campaigns', () => {
  it('Deploys a factory and campaign', async () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });

  it('marks caller as campaign manager', async () => {
    const manager = await campaign.methods.manager().call();
    assert.equal(accounts[1], manager);
  });

  it('allows people to contribute', async () => {
    await campaign.methods
      .contribute()
      .send({ from: accounts[2], value: '900' });
    const isContributor = await campaign.methods.approvers(accounts[2]).call();
    assert(isContributor);
  });

  it('requires a minimum contribution', async () => {
    try {
      await campaign.methods
        .contribute()
        .send({ from: accounts[2], value: '50' });
      assert(false);
    } catch (e) {
      assert(e);
    }
  });

  it('allows a manger to make a payment request', async () => {
    const description = 'I wanna buy stuff';
    const value = '1000000';

    await campaign.methods.createRequest(description, value, accounts[4]).send({
      from: accounts[1],
      gas: '1000000',
    });

    request = await campaign.methods.requests(0).call();
    assert(request);
    assert.equal('I wanna buy stuff', request.description);
  });

  it('processes requests', async () => {
    await campaign.methods.contribute().send({
      from: accounts[2],
      value: web3.utils.toWei('50', 'ether'),
    });

    const description = 'I wanna buy stuff';
    const value = web3.utils.toWei('40', 'ether');

    await campaign.methods.createRequest(description, value, accounts[4]).send({
      from: accounts[1],
      gas: '1000000',
    });

    await campaign.methods.approveRequest(0).send({
      from: accounts[2],
      gas: '1000000',
    });

    await campaign.methods.finalizeRequest(0).send({
      from: accounts[1],
      gas: '1000000',
    });

    let balance = await web3.eth.getBalance(accounts[4]);
    balance = web3.utils.fromWei(balance, 'ether');

    assert.equal('140', balance);
  });
});
