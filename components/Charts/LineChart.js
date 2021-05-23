import { Line } from "react-chartjs-2";

const LineChart = ({ dataSetData, dataLabels }) => {
    const data = {
        labels: dataLabels,
        datasets: [
            {
                label: "Rewards (HNT)",
                data: dataSetData,
                fill: false,
                backgroundColor: "rgb(255, 99, 132)",
                borderColor: "rgba(255, 99, 132, 0.2)",
            },
        ],
    };

    const options = {
        scales: {
            yAxes: [
                {
                    ticks: {
                        beginAtZero: true,
                    },
                },
            ],
        },
    };

    return (
        <>
            <div className="header">
                <h1 className="title">Line Chart</h1>
                <div className="links">
                    <a
                        className="btn btn-gh"
                        href="https://github.com/reactchartjs/react-chartjs-2/blob/master/example/src/charts/Line.js"
                    >
                        Github Source
                    </a>
                </div>
            </div>
            <Line data={data} options={options} />
        </>
    );
};

export default LineChart;
