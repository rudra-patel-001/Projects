import React from 'react';
import { Bar } from 'react-chartjs-2'; // Corrected import
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'; // Corrected import

// Register the necessary ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ComparisonChart = ({ originalSize, compressedSize }) => {
  // Prepare the chart data
  const data = {
    labels: ['Original', 'Compressed'],
    datasets: [
      {
        label: 'Size (MB)',
        data: [originalSize, compressedSize],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Configure the chart options
  const options = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${value} MB`,
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: 'Image Size Comparison',
      },
    },
  };

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default ComparisonChart;