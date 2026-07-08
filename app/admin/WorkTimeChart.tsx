import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type ChartData = {
  name: string;
  hours: number;
};

export default function WorkTimeChart() {
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    async function loadChartData() {
      const res = await fetch("/api/worktime-chart");
      const data = await res.json();
      setChartData(data);
    }

    loadChartData();
  }, []);

  const data = {
    labels: chartData.map((item) => item.name),
    datasets: [
      {
        label: "勤務時間（分）",
        data: chartData.map((item) => item.hours),
        backgroundColor: "#3b82f6",
        borderColor: "#2563eb",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="mt-8 rounded-xl bg-white p-6 shadow">
      <h2 className="text-2xl font-bold">社員別勤務時間グラフ</h2>

      <div className="mt-4 h-80">
  <Bar data={data} options={{ ...options, maintainAspectRatio: false }} />
</div>
    </div>
  );
}