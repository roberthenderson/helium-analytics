import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import PropTypes from 'prop-types';
import { useHotspotRewards } from '../../hooks/useRequest';

const RewardsChart = ({ type, hotspotAddress }) => {
    RewardsChart.propTypes = {
        type: PropTypes.string.isRequired,
        hotspotAddress: PropTypes.string.isRequired
    };
    const { rewards, error, isLoadingMore, size, setSize, isReachingEnd } =
        useHotspotRewards(hotspotAddress);
    if (rewards) {
        const chartData = {
            labels: rewards.datesInOrder,
            datasets: [
                {
                    label: 'Rewards (HNT)',
                    data: rewards.incrementedRewards,
                    fill: true,
                    backgroundColor: 'rgb(255, 99, 132)',
                    borderColor: 'rgba(255, 99, 132, 0.2)'
                }
            ]
        };

        const chartOptions = {
            scales: {
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: true
                        }
                    }
                ]
            }
        };

        let chart;
        if (type === 'line') {
            chart = <Line data={chartData} options={chartOptions} />;
        } else if (type === 'bar') {
            chart = <Bar data={chartData} options={chartOptions} />;
        }

        return <>{chart}</>;
    }
    return <>Loading chart...</>;
};

export default React.memo(RewardsChart);
