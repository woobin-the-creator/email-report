import React from 'react'

const Editor: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>차트 에디터</h1>
      <p>드래그앤드롭 기반 차트 레이아웃 에디터</p>
      <p style={{ color: '#888' }}>
        Phase 2에서 react-grid-layout 구현 예정
      </p>
      <div style={{
        marginTop: '20px',
        padding: '20px',
        border: '2px dashed #666',
        borderRadius: '8px'
      }}>
        <p>여기에 드래그앤드롭 그리드가 표시됩니다</p>
      </div>
    </div>
  )
}

export default Editor
