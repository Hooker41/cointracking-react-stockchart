import React, { Component } from 'react';
import './app.css';
import { TypeChooser } from "react-stockcharts/lib/helper";
import Chart from './Chart';

import { Container, Row, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';

const { total } = require('./data');
export default class App extends Component {
  constructor(props, context) {
    super(props, context);

    this.handleChange = this.handleChange.bind(this);
    this.getData = this.getData.bind(this);
    this.getSampleData = this.getSampleData.bind(this);

    this.state = {
      value: 0,
    };
  }

  componentDidMount() {
    this.getData(this.state.value);
    // this.getSampleData(this.state.value);
  }
  handleChange(value, event) {
    this.setState({ value });
    this.getData(value);
    // this.getSampleData(value);
  }
  getData(value) {
    fetch('/api/getHistoricalSummary?type='+value)
    .then(res => res.json())
    .then(result => {
      let historical = result.result.historical;
      let total = historical.Total;
      let data = [];
      for ( let time in total ){
        data.push({
          'date': new Date(time * 1000),
          'open': parseFloat(total[time]),
          'high': parseFloat(total[time]),
          'low': parseFloat(total[time]),
          'close': parseFloat(total[time]),
          'volume': parseFloat(total[time])
        });
      }
      this.setState({ data });
    });
  }
  getSampleData(value){
    let data = [];
    for ( let time in total ){
      data.push({
        'date': new Date(time * 1000),
        'open': parseFloat(total[time]),
        'high': parseFloat(total[time]),
        'low': parseFloat(total[time]),
        'close': parseFloat(total[time]),
        'volume': parseFloat(total[time])
      });
    }
    this.setState({ data });
  }
  render() {
    if (this.state.data == null) {
			return <div>Loading...</div>
		}
    return (
      <Container fluid={true} className="mx-3">
        <Row className="py-3">
          Select Chart Type
        </Row>
        <Row>
          <ToggleButtonGroup
            type="radio"
            value={this.state.value}
            onChange={this.handleChange}
            name="chartType"
          >
            <ToggleButton value={0}>USD</ToggleButton>
            <ToggleButton value={1}>BTC</ToggleButton>
          </ToggleButtonGroup>
        </Row>
        <Row className="py-3">
          <Chart data={this.state.data} />
        </Row>
      </Container>
    );
  }
}
