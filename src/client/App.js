import React, { Component } from 'react';
import './app.css';
import { TypeChooser } from "react-stockcharts/lib/helper";
import Chart from './Chart';
const { total } = require('./data');
export default class App extends Component {
  componentDidMount() {
    // fetch('/api/getHistoricalSummary')
    // .then(res => res.json())
    // .then(result => {
    //   let historical = result.result.historical;
    //   let total = historical.Total;
    //   console.log({total});
    //   let data = [];
    //   for ( let time in total ){
    //     data.push({
    //       'date': new Date(time * 1000),
    //       'open': parseFloat(total[time]),
    //       'high': parseFloat(total[time]),
    //       'low': parseFloat(total[time]),
    //       'close': parseFloat(total[time]),
    //       'volume': parseFloat(total[time])
    //     });
    //   }
    //   console.log({data});
    //   this.setState({ data });
    // });
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
    if (this.state == null) {
			return <div>Loading...</div>
		}
    return (
      <div className="chartContainer">
        <Chart data={this.state.data} />
      </div>
    );
  }
}
