import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BarChart, LineChart, PieChart, CombinationChart } from '../components/charts'
import { fetchDataQuery, formatDateForApi } from '../api/client'
import type { ChartDataItem } from '../types/api'

// 샘플 데이터 (폴백용 - API 호출 실패 시 사용)
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

// API 사용 여부 (개발 모드에서는 false로 설정하여 샘플 데이터 사용)
const USE_API = import.meta.env.VITE_USE_API === 'true'

const Report: React.FC = () => {
  const { date } = useParams<{ date: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 차트 데이터 상태
  const [monthlySales, setMonthlySales] = useState<ChartDataItem[]>(monthlySalesData)
  const [dailyVisitors, setDailyVisitors] = useState<ChartDataItem[]>(dailyVisitorsData)
  const [category, setCategory] = useState<ChartDataItem[]>(categoryData)
  const [salesProfit, setSalesProfit] = useState<ChartDataItem[]>(salesProfitData)

  // 날짜 포맷팅 및 유효성 검사 (yyyymmdd → yyyy년 mm월 dd일)
  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '날짜 없음'

    // 숫자 8자리 형식 검증
    if (!/^\d{8}$/.test(dateStr)) return '잘못된 날짜 형식'

    const year = parseInt(dateStr.slice(0, 4))
    const month = parseInt(dateStr.slice(4, 6))
    const day = parseInt(dateStr.slice(6, 8))

    // 날짜 범위 검증
    if (year < 2000 || year > 2100) return '잘못된 연도'
    if (month < 1 || month > 12) return '잘못된 월'
    if (day < 1 || day > 31) return '잘못된 일'

    // 월별 일수 검증 (간단 버전)
    const daysInMonth = new Date(year, month, 0).getDate()
    if (day > daysInMonth) return '잘못된 날짜'

    return `${year}년 ${month}월 ${day}일`
  }

  useEffect(() => {
    const loadReportData = async () => {
      if (!date) {
        setError('날짜 파라미터가 없습니다')
        setLoading(false)
        return
      }

      // API 사용하지 않는 경우 샘플 데이터 사용
      if (!USE_API) {
        console.log('개발 모드: 샘플 데이터 사용')
        setTimeout(() => setLoading(false), 300)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // 날짜 형식 변환 (yyyymmdd → yyyy-mm-dd)
        const apiDate = formatDateForApi(date)

        console.log('API 호출 시작:', apiDate)

        // 4개 차트 데이터 병렬 로딩
        const results = await Promise.allSettled([
          // Bar Chart - 월별 매출
          fetchDataQuery({
            table_name: 'monthly_sales',
            columns: ['month', 'sales', 'target'],
            start_date: '2025-01-01',
            end_date: '2025-12-31',
            limit: 12,
          }),

          // Line Chart - 일별 방문자
          fetchDataQuery({
            table_name: 'daily_visitors',
            columns: ['day', 'visitors', 'pageViews'],
            start_date: apiDate,
            end_date: apiDate,
            date_column: 'date',
            limit: 7,
          }),

          // Pie Chart - 카테고리별 매출
          fetchDataQuery({
            table_name: 'category_sales',
            columns: ['name', 'value'],
            start_date: apiDate,
            end_date: apiDate,
            limit: 10,
          }),

          // Combination Chart - 매출 vs 수익
          fetchDataQuery({
            table_name: 'sales_profit',
            columns: ['month', 'sales', 'profit'],
            start_date: '2025-01-01',
            end_date: '2025-12-31',
            limit: 12,
          }),
        ])

        // 결과 처리 (성공한 데이터는 사용, 실패한 데이터는 샘플 데이터 폴백)
        const [monthlySalesResult, dailyVisitorsResult, categoryResult, salesProfitResult] =
          results

        if (monthlySalesResult.status === 'fulfilled') {
          setMonthlySales(monthlySalesResult.value.data)
          console.log('월별 매출 데이터 로드 성공:', monthlySalesResult.value.count, '건')
        } else {
          console.warn('월별 매출 API 실패, 샘플 데이터 사용:', monthlySalesResult.reason)
        }

        if (dailyVisitorsResult.status === 'fulfilled') {
          setDailyVisitors(dailyVisitorsResult.value.data)
          console.log('일별 방문자 데이터 로드 성공:', dailyVisitorsResult.value.count, '건')
        } else {
          console.warn('일별 방문자 API 실패, 샘플 데이터 사용:', dailyVisitorsResult.reason)
        }

        if (categoryResult.status === 'fulfilled') {
          setCategory(categoryResult.value.data)
          console.log('카테고리 데이터 로드 성공:', categoryResult.value.count, '건')
        } else {
          console.warn('카테고리 API 실패, 샘플 데이터 사용:', categoryResult.reason)
        }

        if (salesProfitResult.status === 'fulfilled') {
          setSalesProfit(salesProfitResult.value.data)
          console.log('매출/수익 데이터 로드 성공:', salesProfitResult.value.count, '건')
        } else {
          console.warn('매출/수익 API 실패, 샘플 데이터 사용:', salesProfitResult.reason)
        }

        // 모든 API가 실패한 경우 에러 표시
        const allFailed = results.every((result) => result.status === 'rejected')
        if (allFailed) {
          setError('모든 데이터 로딩에 실패했습니다. 샘플 데이터를 표시합니다.')
        }
      } catch (err) {
        console.error('리포트 데이터 로딩 실패:', err)
        setError(err instanceof Error ? err.message : '데이터 로딩 중 오류 발생')
      } finally {
        setLoading(false)
      }
    }

    loadReportData()
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
        {error && (
          <div style={styles.errorBanner}>
            ⚠️ {error}
          </div>
        )}
      </header>

      {/* 차트 그리드 */}
      <div style={styles.chartGrid}>
        {/* Bar Chart - 월별 매출 */}
        <div style={styles.chartCard}>
          <BarChart
            data={monthlySales}
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
            data={dailyVisitors}
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
            data={category}
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
            data={salesProfit}
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
  errorBanner: {
    marginTop: '16px',
    padding: '12px 16px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: '8px',
    fontSize: '14px',
    border: '1px solid #fbbf24',
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
