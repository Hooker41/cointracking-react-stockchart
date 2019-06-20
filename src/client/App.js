import React, { Component } from 'react';
import './app.css';
import { TypeChooser } from "react-stockcharts/lib/helper";
import Chart from './Chart';

import { Container, Row, Col, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';

const { total } = require('./data');
export default class App extends Component {
  constructor(props, context) {
    super(props, context);

    this.handleChange = this.handleChange.bind(this);
    this.handleChangeVisible = this.handleChangeVisible.bind(this);
    this.handleChangeTF = this.handleChangeTF.bind(this);
    this.getData = this.getData.bind(this);
    this.getSampleData = this.getSampleData.bind(this);

    this.state = {
      value: 0,
      indicatorVisible: true,
      timeframe:1
    };
  }

  componentDidMount() {
    this.getData(this.state.value);
    // this.getSampleData(this.state.value);
    setInterval(function(){
      this.getData(this.state.value);
      // this.getSampleData(this.state.value);
    }, 300000);
  }
  handleChange(value, event) {
    this.setState({ value });
    this.getData(value);
    // this.getSampleData(value);
  }
  handleChangeVisible(value, event) {
    this.setState({ indicatorVisible: value });
  }
  handleChangeTF(value, event) {
    this.setState({ timeframe: value });
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
        <Row className="py-3 text-center">
          <Col md={4}>
            Select Chart Type
          </Col>
          <Col md={4}>
          </Col>
          <Col md={4}>
            Show/Hide Indicators
          </Col>
        </Row>
        <Row className="text-center">
          <Col md={4}>
            <ToggleButtonGroup
              type="radio"
              value={this.state.value}
              onChange={this.handleChange}
              name="chartType"
            >
              <ToggleButton value={0}>USD</ToggleButton>
              <ToggleButton value={1}>BTC</ToggleButton>
            </ToggleButtonGroup>
          </Col>
          <Col md={4}>
            <ToggleButtonGroup
              type="radio"
              value={this.state.timeframe}
              onChange={this.handleChangeTF}
              name="timeframe"
            >
              <ToggleButton value={1}>1D</ToggleButton>
              <ToggleButton value={3}>3D</ToggleButton>
              <ToggleButton value={7}>1W</ToggleButton>
            </ToggleButtonGroup>
          </Col>
          <Col md={4}>
            <ToggleButtonGroup
              type="radio"
              value={this.state.indicatorVisible}
              onChange={this.handleChangeVisible}
              name="showhide"
            >
              <ToggleButton value={true}>Show</ToggleButton>
              <ToggleButton value={false}>Hide</ToggleButton>
            </ToggleButtonGroup>
          </Col>
        </Row>
        <Row className="py-3">
          <Chart visible={this.state.indicatorVisible} timeframe={this.state.timeframe} data={this.state.data} />
        </Row>
      </Container>
    );
  }
}
