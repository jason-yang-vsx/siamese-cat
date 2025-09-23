/**
 * BridgeStatus Component
 * 顯示 Bridge 連接狀態和控制面板
 */

import React from 'react';
import { useBridge } from '@/hooks/useBridge';
import styles from './BridgeStatus.module.css';

export const BridgeStatus: React.FC = () => {
  const {
    students,
    connectionStatus,
    connectionInfo,
    platform,
    isLoading,
    error,
    isConnected,
    connect,
    disconnect,
    getStudentList,
    pickStudent,
    removeStudent,
    retryConnection,
    clearError
  } = useBridge();

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return '#4caf50';
      case 'connecting':
        return '#ff9800';
      case 'error':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return '已連接';
      case 'connecting':
        return '連接中...';
      case 'error':
        return '連接錯誤';
      default:
        return '未連接';
    }
  };

  const handlePickRandom = async () => {
    if (students.length === 0) {
      alert('沒有學生資料');
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * students.length);
    const randomStudent = students[randomIndex];
    const success = await pickStudent(randomStudent.studentId);
    
    if (success) {
      alert(`已選中: ${randomStudent.name}`);
    }
  };

  const handleRemoveFirst = async () => {
    if (students.length === 0) {
      alert('沒有學生資料');
      return;
    }
    
    if (students.length <= 2) {
      alert('無法移除：至少需要保留 2 名學生');
      return;
    }
    
    const firstStudent = students[0];
    const success = await removeStudent(firstStudent.studentId);
    
    if (success) {
      alert(`已移除: ${firstStudent.name}`);
    }
  };

  return (
    <div className={styles.container}>
      {/* 狀態標題 */}
      <div className={styles.header}>
        <h2>Bridge 連接狀態</h2>
        <div 
          className={styles.statusIndicator}
          style={{ backgroundColor: getStatusColor() }}
        />
      </div>

      {/* 連接資訊 */}
      <div className={styles.info}>
        <div className={styles.infoRow}>
          <span className={styles.label}>狀態：</span>
          <span className={styles.value}>{getStatusText()}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>平台：</span>
          <span className={styles.value}>{platform.toUpperCase()}</span>
        </div>
        {connectionInfo.lastActivity && (
          <div className={styles.infoRow}>
            <span className={styles.label}>最後活動：</span>
            <span className={styles.value}>
              {new Date(connectionInfo.lastActivity).toLocaleTimeString()}
            </span>
          </div>
        )}
        <div className={styles.infoRow}>
          <span className={styles.label}>學生數量：</span>
          <span className={styles.value}>{students.length}</span>
        </div>
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div className={styles.error}>
          <span>{error}</span>
          <button onClick={clearError} className={styles.closeButton}>
            ✕
          </button>
        </div>
      )}

      {/* 控制按鈕 */}
      <div className={styles.controls}>
        {!isConnected ? (
          <button 
            onClick={connect} 
            disabled={isLoading}
            className={styles.button}
          >
            {isLoading ? '連接中...' : '連接'}
          </button>
        ) : (
          <button 
            onClick={disconnect}
            className={`${styles.button} ${styles.dangerButton}`}
          >
            斷開連接
          </button>
        )}
        
        {isConnected && (
          <>
            <button 
              onClick={getStudentList}
              disabled={isLoading}
              className={styles.button}
            >
              {isLoading ? '載入中...' : '獲取學生列表'}
            </button>
            
            {students.length > 0 && (
              <>
                <button 
                  onClick={handlePickRandom}
                  className={styles.button}
                >
                  隨機選擇學生
                </button>
                
                <button 
                  onClick={handleRemoveFirst}
                  disabled={students.length <= 2}
                  className={`${styles.button} ${styles.warningButton}`}
                >
                  移除第一位學生
                </button>
              </>
            )}
          </>
        )}
        
        {connectionStatus === 'error' && (
          <button 
            onClick={retryConnection}
            className={styles.button}
          >
            重試連接
          </button>
        )}
      </div>

      {/* 學生列表 */}
      {students.length > 0 && (
        <div className={styles.studentList}>
          <h3>學生列表</h3>
          <div className={styles.studentGrid}>
            {students.map((student) => (
              <div key={student.studentId} className={styles.studentCard}>
                <span className={styles.studentName}>{student.name}</span>
                {student.seatNumber && (
                  <span className={styles.seatNumber}>座號: {student.seatNumber}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 開發模式提示 */}
      {platform === 'web' && (
        <div className={styles.devNote}>
          <strong>開發模式：</strong>使用 Mock 資料進行測試
        </div>
      )}
    </div>
  );
};