import React, { Component } from 'react';
import { Card } from 'semantic-ui-react';

import factory from '../ethereum/factory';

class Index extends Component {
  static async getInitialProps() {
    const campaigns = await factory.methods.getCampaigns().call();
    return { campaigns };
  }

  renderCampaigns() {
    const items = this.props.campaigns.map(address => {
      return {
        header: address,
        description: <a>View campaign</a>,
        fluid: true,
      };
    });

    return <Card.Group items={items} />;
  }

  render() {
    const [campaign] = this.props.campaigns;
    return <div>{this.renderCampaigns()}</div>;
  }
}

export default Index;
