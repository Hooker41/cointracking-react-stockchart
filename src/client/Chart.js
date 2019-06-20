
import React, {Fragment} from "react";
import PropTypes from "prop-types";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import { ChartCanvas, Chart } from "react-stockcharts";
import {
	CandlestickSeries,
	LineSeries,
	BollingerSeries,
	BarSeries,
	AreaSeries,
} from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
	CrossHairCursor,
	CurrentCoordinate,
	MouseCoordinateX,
	MouseCoordinateY,
} from "react-stockcharts/lib/coordinates";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { OHLCTooltip, BollingerBandTooltip } from "react-stockcharts/lib/tooltip";
import { bollingerBand } from "react-stockcharts/lib/indicator";
import { fitWidth } from "react-stockcharts/lib/helper";
import { last } from "react-stockcharts/lib/utils";
import {
	Label,
	Annotate,
	SvgPathAnnotation,
	buyPath,
	sellPath,
	LabelAnnotation
} from "react-stockcharts/lib/annotation";

import TDSequential from "tdsequential";

const bbStroke = {
	top: "#000000",
	middle: "#000000",
	bottom: "#000000",
};

const bbFill = "#ffffff";

class BalanceChart extends React.Component {
	calcNewTF = (subResult) => {
		let date = subResult[0]['date'];
		let open = subResult[0]['open'];
		let high = subResult[0]['high'];
		let low = subResult[0]['low'];
		let close = subResult[subResult.length-1]['close'];
		let volume = 0;
		for ( let k in subResult){
			let bar = subResult[k];
			volume += bar['volume'];
			high = Math.max(high, bar['high']);
			low = Math.min(low, bar['low']);
		}
		return {date, open, high, low, close, volume};
	}

	convertTimeFrame = () => {
		const { data: result, timeframe } = this.props;
		let newResult = [];
		// covert timeframe.
		const minInterval = timeframe * 24 * 60 * 60 * 1000;
		let subResult = [];
		let nextStop = new Date(result[0]['date']).getTime() + minInterval;
		for (let i  = 0; i < result.length; i++){
			let bar = result[i];
			if (new Date(bar['date']).getTime() < nextStop){
				subResult.push(bar);
			} else {
				if(subResult.length > 0){
					newResult.push(this.calcNewTF(subResult));
				}
				subResult = [bar];
				nextStop = new Date(result[i]['date']).getTime() + minInterval;
			}
		}
		if(subResult.length > 0){
		  	newResult.push(this.calcNewTF(subResult));
		}
		return newResult;
	}
	render() {
		const defaultAnnotationProps = {
			fontFamily: "Glyphicons Halflings",
			fontSize: 14,
		};
		const buycountdown = {
			...defaultAnnotationProps,
			fill: "#E20000",
			text: (d) => d.buyCoundownIndex,
			y: ({ yScale, datum }) => yScale(datum.low) + 20,
			tooltip: "buyCountdownIndex",
		};
		const sellcountdown = {
			...defaultAnnotationProps,
			fill: "#006517",
			text: (d) => d.sellCoundownIndex,
			y: ({ yScale, datum }) => yScale(datum.high) - 20,
			tooltip: "sellCountdownIndex",
		};
		const bb = bollingerBand()
			.merge((d, c) => {d.bb = c;})
			.accessor(d => d.bb);

		const { data: initialData, width, ratio, interpolation } = this.props;
		var newTFDate = this.convertTimeFrame();
		var result = TDSequential(newTFDate);
		var mergedData = newTFDate.map((item, idx)=>{
			let ele = result[idx];
			let newItem = {...item, ...ele};
			return newItem;
		});
		const calculatedData = bb(mergedData);
		const xScaleProvider = discontinuousTimeScaleProvider
			.inputDateAccessor(d => d.date);
		const {
			data,
			xScale,
			xAccessor,
			displayXAccessor,
		} = xScaleProvider(calculatedData);

		const start = xAccessor(last(data));
		const end = xAccessor(data[0]);
		const xExtents = [start, end];
		return (
			<ChartCanvas height={400}
				width={width}
				ratio={ratio}
				seriesName="balance"
				margin={{ left: 70, right: 70, top: 10, bottom: 30 }}
				data={data}
				xScale={xScale}
				xAccessor={xAccessor}
				displayXAccessor={displayXAccessor}
				xExtents={xExtents}
			>
				<Chart id={1}
					yExtents={[d => [d.high, d.low], bb.accessor()]}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom"/>
					<YAxis axisAt="left" orient="left" ticks={5}/>

					<MouseCoordinateX
						at="bottom"
						orient="bottom"
						displayFormat={timeFormat("%Y-%m-%d")} />
					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />
					<LineSeries
						yAccessor={d => d.close}
						interpolation={interpolation}
						stroke="#87CEEB"
						strokeWidth={2}
					/>
					<OHLCTooltip/>
					{
						this.props.visible ?
						<Fragment>
							<BollingerSeries yAccessor={d => d.bb}
								stroke={bbStroke}
								fill={bbFill} />
							<BollingerBandTooltip
								yAccessor={d => d.bb}
								options={bb.options()}
								origin={[0, 20]}
								/>
							<Annotate with={LabelAnnotation} when={d => d.buyCoundownIndex > 0 && d.buyCoundownIndex < 10}
								usingProps={buycountdown} />
							<Annotate with={LabelAnnotation} when={d => d.sellCoundownIndex > 0 && d.sellCoundownIndex < 10}
								usingProps={sellcountdown} />
						</Fragment>:""
					}
				</Chart>
				<CrossHairCursor />
			</ChartCanvas>
		);
	}
}

BalanceChart.propTypes = {
	data: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	ratio: PropTypes.number.isRequired,
	visible: PropTypes.bool.isRequired,
	timeframe: PropTypes.number.isRequired,
};
BalanceChart = fitWidth(BalanceChart);

export default BalanceChart;
