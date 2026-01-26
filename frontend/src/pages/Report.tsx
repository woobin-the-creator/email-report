import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BarChart, LineChart, PieChart, CombinationChart } from '../components/charts'
import { fetchDataQuery, formatDateForApi } from '../api/client'
import type { ChartDataItem } from '../types/api'

// 샘플 데이터 (폴백용 - API 호출 실패 시 사용)
const dailyFccData = [
  { cdate_day: '2025-01-20', avg_fcc: 1200 },
  { cdate_day: '2025-01-21', avg_fcc: 1350 },
  { cdate_day: '2025-01-22', avg_fcc: 1180 },
  { cdate_day: '2025-01-23', avg_fcc: 1420 },
  { cdate_day: '2025-01-24', avg_fcc: 1290 },
  { cdate_day: '2025-01-25', avg_fcc: 1380 },
  { cdate_day: '2025-01-26', avg_fcc: 1250 },
]

const weeklyFccData = [
  { cdate_week: '202503', avg_fcc: 1280 },
  { cdate_week: '202504', avg_fcc: 1320 },
  { cdate_week: '202505', avg_fcc: 1250 },
  { cdate_week: '202506', avg_fcc: 1290 },
]

const fccGroupData = [
  { fcc_group: 'Mobile', avg_fcc: 1450 },
  { fcc_group: 'Desktop', avg_fcc: 980 },
  { fcc_group: 'Tablet', avg_fcc: 1120 },
]

const fccGroupComparisonData = [
  { fcc_group: 'Mobile', avg_fcc: 1450, max_fcc: 2200 },
  { fcc_group: 'Desktop', avg_fcc: 980, max_fcc: 1650 },
  { fcc_group: 'Tablet', avg_fcc: 1120, max_fcc: 1890 },
]

// API 사용 여부 (개발 모드에서는 false로 설정하여 샘플 데이터 사용)
const USE_API = import.meta.env.VITE_USE_API === 'true'

const Report: React.FC = () => {
  const { date } = useParams<{ date: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 차트 데이터 상태
  const [dailyFcc, setDailyFcc] = useState<ChartDataItem[]>(dailyFccData)
  const [weeklyFcc, setWeeklyFcc] = useState<ChartDataItem[]>(weeklyFccData)
  const [fccGroup, setFccGroup] = useState<ChartDataItem[]>(fccGroupData)
  const [fccGroupComparison, setFccGroupComparison] = useState<ChartDataItem[]>(fccGroupComparisonData)

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

        // 날짜 계산 (최근 7일, 4주, 1개월)
        const endDate = new Date(apiDate)

        // 최근 7일
        const last7Days = new Date(endDate)
        last7Days.setDate(endDate.getDate() - 6)
        const startDate7Days = last7Days.toISOString().split('T')[0]

        // 최근 4주 (28일)
        const last4Weeks = new Date(endDate)
        last4Weeks.setDate(endDate.getDate() - 27)
        const startDate4Weeks = last4Weeks.toISOString().split('T')[0]

        // 최근 1개월
        const lastMonth = new Date(endDate)
        lastMonth.setMonth(endDate.getMonth() - 1)
        const startDateMonth = lastMonth.toISOString().split('T')[0]

        console.log('API 호출 시작:', { apiDate, startDate7Days, startDate4Weeks, startDateMonth })

        // 4개 차트 데이터 병렬 로딩 (fcc_data 기반)
        const results = await Promise.allSettled([
          // Bar Chart - 일별 FCC 평균 (최근 7일)
          fetchDataQuery({
            table_name: 'fcc_data',
            columns: [],
            start_date: startDate7Days,
            end_date: apiDate,
            date_column: 'cdate',
            group_by_period: 'day',
            aggregations: [
              { column: 'fcc', function: 'AVG', alias: 'avg_fcc' },
            ],
            limit: 7,
          }),

          // Line Chart - 주별 FCC 평균 (최근 4주)
          fetchDataQuery({
            table_name: 'fcc_data',
            columns: [],
            start_date: startDate4Weeks,
            end_date: apiDate,
            date_column: 'cdate',
            group_by_period: 'week',
            aggregations: [
              { column: 'fcc', function: 'AVG', alias: 'avg_fcc' },
            ],
            limit: 4,
          }),

          // Pie Chart - FCC 그룹별 평균 (최근 1개월)
          fetchDataQuery({
            table_name: 'fcc_data',
            columns: ['fcc_group'],
            start_date: startDateMonth,
            end_date: apiDate,
            date_column: 'cdate',
            aggregations: [
              { column: 'fcc', function: 'AVG', alias: 'avg_fcc' },
            ],
            limit: 10,
          }),

          // Combination Chart - 그룹별 FCC 평균 vs 최대값 (최근 1개월)
          fetchDataQuery({
            table_name: 'fcc_data',
            columns: ['fcc_group'],
            start_date: startDateMonth,
            end_date: apiDate,
            date_column: 'cdate',
            aggregations: [
              { column: 'fcc', function: 'AVG', alias: 'avg_fcc' },
              { column: 'fcc', function: 'MAX', alias: 'max_fcc' },
            ],
            limit: 10,
          }),
        ])

        // 결과 처리 (성공한 데이터는 사용, 실패한 데이터는 샘플 데이터 폴백)
        const [dailyFccResult, weeklyFccResult, fccGroupResult, fccGroupComparisonResult] =
          results

        if (dailyFccResult.status === 'fulfilled') {
          setDailyFcc(dailyFccResult.value.data)
          console.log('일별 FCC 데이터 로드 성공:', dailyFccResult.value.count, '건')
        } else {
          console.warn('일별 FCC API 실패, 샘플 데이터 사용:', dailyFccResult.reason)
        }

        if (weeklyFccResult.status === 'fulfilled') {
          setWeeklyFcc(weeklyFccResult.value.data)
          console.log('주별 FCC 데이터 로드 성공:', weeklyFccResult.value.count, '건')
        } else {
          console.warn('주별 FCC API 실패, 샘플 데이터 사용:', weeklyFccResult.reason)
        }

        if (fccGroupResult.status === 'fulfilled') {
          setFccGroup(fccGroupResult.value.data)
          console.log('FCC 그룹 데이터 로드 성공:', fccGroupResult.value.count, '건')
        } else {
          console.warn('FCC 그룹 API 실패, 샘플 데이터 사용:', fccGroupResult.reason)
        }

        if (fccGroupComparisonResult.status === 'fulfilled') {
          setFccGroupComparison(fccGroupComparisonResult.value.data)
          console.log('FCC 그룹 비교 데이터 로드 성공:', fccGroupComparisonResult.value.count, '건')
        } else {
          console.warn('FCC 그룹 비교 API 실패, 샘플 데이터 사용:', fccGroupComparisonResult.reason)
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
        {/* Bar Chart - 일별 FCC 평균 (최근 7일) */}
        <div style={styles.chartCard}>
          <BarChart
            data={dailyFcc}
            xAxisKey="cdate_day"
            yAxisKey="avg_fcc"
            title="일별 FCC 평균 (최근 7일)"
            thresholdValue={1300}
            thresholdLabel="목표"
            showDataLabel
            height={280}
          />
        </div>

        {/* Line Chart - 주별 FCC 추이 (최근 4주) */}
        <div style={styles.chartCard}>
          <LineChart
            data={weeklyFcc}
            xAxisKey="cdate_week"
            yAxisKey="avg_fcc"
            title="주별 FCC 추이 (최근 4주)"
            thresholdValue={1300}
            thresholdLabel="목표"
            showDataLabel
            lineType="monotone"
            height={280}
          />
        </div>

        {/* Pie Chart - FCC 그룹별 평균 */}
        <div style={styles.chartCard}>
          <PieChart
            data={fccGroup}
            dataKey="avg_fcc"
            nameKey="fcc_group"
            title="FCC 그룹별 평균 비율"
            showDataLabel
            height={280}
          />
        </div>

        {/* Combination Chart - 그룹별 FCC 평균 vs 최대값 */}
        <div style={styles.chartCard}>
          <CombinationChart
            data={fccGroupComparison}
            xAxisKey="fcc_group"
            barKey="avg_fcc"
            lineKey="max_fcc"
            title="FCC 그룹별 평균 vs 최대값"
            thresholdValue={1500}
            thresholdLabel="목표 평균"
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
