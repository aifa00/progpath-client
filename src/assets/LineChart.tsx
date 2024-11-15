import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, LineElement, PointElement, Filler} from 'chart.js';

import { ChartData, ChartOptions } from 'chart.js';

interface LineChartProps {
    data: ChartData<'line'>;    
}

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, LineElement, PointElement, Filler);

const LineChart: React.FC<LineChartProps> = ({ data }) => {

    const options: ChartOptions<'line'> = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#BEBEBE',
                    font: {
                        size: 15
                    },
                    padding: 20
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context: { label: string; raw: any; }) {
                        let label = context.label || '';
                        if (label) {
                            label += `: ${context.raw.toLocaleString()}`;
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#BEBEBE',
                },
                title: {
                    display: true,
                    text: 'Date'
                }
            },
            y: {
                ticks: {
                    color: '#BEBEBE',
                },
                title: {
                    display: true,
                    text: 'Remaining Tasks'
                }
            },
        },
    };

    return (
        <Line data={data} options={options} />
    );
}

export default LineChart;
