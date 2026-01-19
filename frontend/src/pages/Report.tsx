import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const Report: React.FC = () => {
  const { date } = useParams<{ date: string }>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Phase 1: API 연동 전 임시 로딩
    setTimeout(() => setLoading(false), 500)
  }, [date])

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>리포트: {date}</h1>
      <p>날짜별 리포트 뷰어 (iframe 삽입용)</p>
      <p style={{ color: '#888' }}>
        Phase 1: API 연동 구현 예정<br />
        Phase 2: Recharts 차트 컴포넌트 표시 예정
      </p>
      <div style={{
        marginTop: '20px',
        padding: '20px',
        border: '2px dashed #666',
        borderRadius: '8px'
      }}>
        <p>여기에 차트들이 표시됩니다</p>
      </div>
    </div>
  )
}

export default Report
