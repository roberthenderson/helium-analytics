import { Line, Bar } from 'react-chartjs-2';
import PropTypes from 'prop-types';

const RewardsChart = ({ type, dataSetData, dataLabels }) => {
    RewardsChart.propTypes = {
        type: PropTypes.string.isRequired,
        dataSetData: PropTypes.array.isRequired,
        dataLabels: PropTypes.array.isRequired
    };
    const data = {
        labels: dataLabels,
        datasets: [
            {
                label: 'Rewards (HNT)',
                data: dataSetData,
                fill: true,
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgba(255, 99, 132, 0.2)'
            }
        ]
    };

    const options = {
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
        chart = <Line data={data} options={options} />;
    } else if (type === 'bar') {
        chart = <Bar data={data} options={options} />;
    }

    return <>{chart}</>;
};

export default RewardsChart;
