import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { ChartData, ChartOptions } from 'chart.js';//to mention types in ts

interface PieChartProps {
    data: ChartData<'pie'>;
}

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart:React.FC<PieChartProps> = ({data}) => {

  const [legendFontSize, setLegendFontSize] = useState<number>(10);


  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 768) {
        setLegendFontSize(5);
      } else {
        setLegendFontSize(10);
      }
    };

    // Set initial font size based on current screen size
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const options:ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#BEBEBE',
          font: {
            size: legendFontSize // Set font size of the legend labels
          },
          padding: 15
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: { label: string; raw: any; }) {
            let label = context.label || '';
            if (label) {
              label += `: ${context.raw}`;
            }
            return label;
          }
        }
      }
    }
  };


  return (
    <Pie data={data} options={options} />
  )
}

export default PieChart;