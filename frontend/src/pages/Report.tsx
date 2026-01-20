import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BarChart, LineChart, PieChart, CombinationChart } from '../components/charts'

// 샘플 데이터 (Phase 1: 하드코딩, Phase 2: API 연동)
const monthlySalesData = [
  { month: '1월', sales: 4200, target: 4000 },
  { month: '2월', sales: 3800, target: 4000 },
  { month: '3월', sales: 5100, target: 4500 },
  { month: '4월', sales: 4700, target: 4500 },
  { month: '5월', sales: 5300, target: 5000 },
  { month: '6월', sales: 4900, target: 5000 },
]

const dailyVisitorsData = [
  { day: '월', visitors: 1200, pageViews: 3600 },
  { day: '화', visitors: 1400, pageViews: 4200 },
  { day: '수', visitors: 1100, pageViews: 3300 },
  { day: '목', visitors: 1600, pageViews: 4800 },
  { day: '금', visitors: 1800, pageViews: 5400 },
  { day: '토', visitors: 900, pageViews: 2700 },
  { day: '일', visitors: 700, pageViews: 2100 },
]

const categoryData = [
  { name: '전자제품', value: 4500 },
  { name: '의류', value: 3200 },
  { name: '식품', value: 2800 },
  { name: '가구', value: 1900 },
  { name: '기타', value: 1200 },
]

const salesProfitData = [
  { month: '1월', sales: 4200, profit: 840 },
  { month: '2월', sales: 3800, profit: 720 },
  { month: '3월', sales: 5100, profit: 1020 },
  { month: '4월', sales: 4700, profit: 940 },
  { month: '5월', sales: 5300, profit: 1100 },
  { month: '6월', sales: 4900, profit: 980 },
]

const Report: React.FC = () => {
  const { date } = useParams<{ date: string }>()
  const [loading, setLoading] = useState(true)

  // 날짜 포맷팅 (yyyymmdd → yyyy년 mm월 dd일)
  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr || dateStr.length !== 8) return dateStr || '날짜 없음'
    const year = dateStr.slice(0, 4)
    const month = dateStr.slice(4, 6)
    const day = dateStr.slice(6, 8)
    return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`
  }

  useEffect(() => {
    // Phase 1: API 연동 전 임시 로딩
    setTimeout(() => setLoading(false), 300)
  }, [date])

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p>리포트 로딩 중...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <header style={styles.header}>
        <h1 style={styles.title}>📊 일일 리포트</h1>
        <p style={styles.date}>{formatDate(date)}</p>
      </header>

      {/* 차트 그리드 */}
      <div style={styles.chartGrid}>
        {/* Bar Chart - 월별 매출 */}
        <div style={styles.chartCard}>
          <BarChart
            data={monthlySalesData}
            xAxisKey="month"
            yAxisKey="sales"
            title="월별 매출 현황"
            thresholdValue={4500}
            thresholdLabel="목표"
            showDataLabel
            height={280}
          />
        </div>

        {/* Line Chart - 일별 방문자 */}
        <div style={styles.chartCard}>
          <LineChart
            data={dailyVisitorsData}
            xAxisKey="day"
            yAxisKey="visitors"
            title="일별 방문자 추이"
            thresholdValue={1500}
            thresholdLabel="평균"
            showDataLabel
            lineType="monotone"
            height={280}
          />
        </div>

        {/* Pie Chart - 카테고리별 매출 */}
        <div style={styles.chartCard}>
          <PieChart
            data={categoryData}
            dataKey="value"
            nameKey="name"
            title="카테고리별 매출 비중"
            showDataLabel
            height={280}
          />
        </div>

        {/* Combination Chart - 매출 및 수익 */}
        <div style={styles.chartCard}>
          <CombinationChart
            data={salesProfitData}
            xAxisKey="month"
            barKey="sales"
            lineKey="profit"
            title="매출 vs 수익 비교"
            thresholdValue={900}
            thresholdLabel="수익 목표"
            showDataLabel
            height={280}
          />
        </div>
      </div>

      {/* 푸터 */}
      <footer style={styles.footer}>
        <p>자동 생성된 리포트입니다. 문의사항은 관리자에게 연락하세요.</p>
      </footer>
    </div>
  )
}

// 스타일 정의
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e0e0e0',
    borderTop: '4px solid #3B82F6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 8px 0',
  },
  date: {
    fontSize: '16px',
    color: '#6b7280',
    margin: 0,
  },
  chartGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
    gap: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  footer: {
    textAlign: 'center',
    marginTop: '32px',
    padding: '16px',
    color: '#9ca3af',
    fontSize: '14px',
  },
}

export default Report
