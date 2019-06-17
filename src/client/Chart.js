
import React from "react";
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
import { OHLCTooltip, MovingAverageTooltip, BollingerBandTooltip } from "react-stockcharts/lib/tooltip";
import { bollingerBand } from "react-stockcharts/lib/indicator";
import { fitWidth } from "react-stockcharts/lib/helper";
import { last } from "react-stockcharts/lib/utils";

const bbStroke = {
	top: "#964B00",
	middle: "#000000",
	bottom: "#964B00",
};

const bbFill = "#4682B4";

class BalanceChart extends React.Component {
	render() {
		const bb = bollingerBand()
			.merge((d, c) => {d.bb = c;})
			.accessor(d => d.bb);

		const { data: initialData, width, ratio, interpolation } = this.props;

		const calculatedData = bb(initialData);
		const xScaleProvider = discontinuousTimeScaleProvider
			.inputDateAccessor(d => d.date);
		const {
			data,
			xScale,
			xAccessor,
			displayXAccessor,
		} = xScaleProvider(calculatedData);

		const start = xAccessor(last(data));
		const end = xAccessor(data[Math.max(0, data.length - 150)]);
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
					onContextMenu={(...rest) => { console.log("chart - context menu", rest); }}
				>
					<XAxis axisAt="bottom" orient="bottom"/>
					<YAxis axisAt="left" orient="left" ticks={5}
						onDoubleClick={(...rest) => { console.log("yAxis - double click", rest); }}
						onContextMenu={(...rest) => { console.log("yAxis - context menu", rest); }}
					/>

					<MouseCoordinateX
						at="bottom"
						orient="bottom"
						displayFormat={timeFormat("%Y-%m-%d")} />
					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />
					<BollingerSeries yAccessor={d => d.bb}
						stroke={bbStroke}
						fill={bbFill} />
					<LineSeries
						yAccessor={d => d.close}
						interpolation={interpolation}
						stroke="#ff7f0e"
						fill="#ff7f0e"
						opacity="0"
					/>
					<BollingerBandTooltip
						yAccessor={d => d.bb}
						options={bb.options()} />
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
};
BalanceChart = fitWidth(BalanceChart);

export default BalanceChart;
