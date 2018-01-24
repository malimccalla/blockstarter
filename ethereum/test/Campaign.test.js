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
});
