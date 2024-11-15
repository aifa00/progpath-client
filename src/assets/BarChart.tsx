import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { ChartData, ChartOptions } from 'chart.js';

interface BarChartProps {
    data: ChartData<'bar'>;    
}

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const BarChart:React.FC<BarChartProps> = ({data}) => {

    const options:ChartOptions<'bar'> = {
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
        }
    };

  return (
    <Bar data={data} options={options} />
  )
}

export default BarChart;