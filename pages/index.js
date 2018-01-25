import React, { Component } from 'react';
import factory from '../ethereum/factory';

class Index extends Component {
  static async getInitialProps() {
    const campaigns = await factory.methods.getCampaigns().call();
    return { campaigns };
  }

  render() {
    const [campaign] = this.props.campaigns;
    return <h1>{campaign}</h1>;
  }
}

export default Index;
