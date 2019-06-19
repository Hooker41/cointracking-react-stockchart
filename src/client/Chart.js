
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
	top: "#964B00",
	middle: "#000000",
	bottom: "#964B00",
};

const bbFill = "#4682B4";

class BalanceChart extends React.Component {
	render() {
		const defaultAnnotationProps = {
			fontFamily: "Glyphicons Halflings",
			fontSize: 14,
		};
		const buySetupPerfection = {
			...defaultAnnotationProps,
			y: ({ yScale, datum }) => yScale(datum.low) + 30,
			fill: "#006517",
			path: buyPath,
			tooltip: "buySetupPerfection",
		};
		const sellSetupPerfection = {
			...defaultAnnotationProps,
			y: ({ yScale, datum }) => yScale(datum.high) - 30,
			fill: "#FF0000",
			path: sellPath,
			tooltip: "sellSetupPerfection",
		};
		const buysetup = {
			...defaultAnnotationProps,
			fill: "#006517",
			text: (d) => d.buySetupIndex,
			y: ({ yScale, datum }) => yScale(datum.high) - 20,
			tooltip: "buySetupIndex",
		};
		const sellsetup = {
			...defaultAnnotationProps,
			fill: "#E20000",
			text: (d) => d.sellSetupIndex,
			y: ({ yScale, datum }) => yScale(datum.high) - 20,
			tooltip: "sellSetupIndex",
		};
		const buycountdown = {
			...defaultAnnotationProps,
			fill: "#006517",
			text: (d) => d.buyCoundownIndex,
			y: ({ yScale, datum }) => yScale(datum.low) + 20,
			tooltip: "buyCountdownIndex",
		};
		const sellcountdown = {
			...defaultAnnotationProps,
			fill: "#E20000",
			text: (d) => d.sellCoundownIndex,
			y: ({ yScale, datum }) => yScale(datum.low) + 20,
			tooltip: "sellCountdownIndex",
		};
		const bb = bollingerBand()
			.merge((d, c) => {d.bb = c;})
			.accessor(d => d.bb);

		const { data: initialData, width, ratio, interpolation } = this.props;
		var result = TDSequential(initialData);
		var mergedData = initialData.map((item, idx)=>{
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
					<BollingerSeries yAccessor={d => d.bb}
						stroke={bbStroke}
						fill={bbFill} />
					{/* <LineSeries
						yAccessor={d => d.close}
						interpolation={interpolation}
						stroke="#ff7f0e"
						fill="#ff7f0e"
						opacity="0"
					/> */}
					<CandlestickSeries />
					<BollingerBandTooltip
						yAccessor={d => d.bb}
						options={bb.options()} />

					<Annotate with={SvgPathAnnotation} when={d => d.buySetupPerfection === true}
						usingProps={buySetupPerfection} />
					<Annotate with={SvgPathAnnotation} when={d => d.sellSetupPerfection === true}
						usingProps={sellSetupPerfection} />
					<Annotate with={LabelAnnotation} when={d => d.buySetupIndex > 0}
						usingProps={buysetup} />
					<Annotate with={LabelAnnotation} when={d => d.sellSetupIndex > 0}
						usingProps={sellsetup} />
					<Annotate with={LabelAnnotation} when={d => d.buyCoundownIndex > 0}
						usingProps={buycountdown} />
					<Annotate with={LabelAnnotation} when={d => d.sellCoundownIndex > 0}
						usingProps={sellcountdown} />
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
