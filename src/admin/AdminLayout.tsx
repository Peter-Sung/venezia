import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminMenu from './AdminMenu';
import EditFallDuration from './pages/EditFallDuration';
import EditSpawnInterval from './pages/EditSpawnInterval';
import EditClearWordCount from './pages/EditClearWordCount';
import ManageWords from './pages/ManageWords';
import ManageUsers from './pages/ManageUsers';
import AdminLogin from './pages/AdminLogin';
import './admin.css';

const AdminLayout: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 컴포넌트가 마운트될 때 sessionStorage를 확인하여 인증 상태를 설정합니다.
    const storedAuth = sessionStorage.getItem('isAdminAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }

    // 브라우저 타이틀을 변경합니다.
    document.title = 'Venezia (Admin)';

    // 컴포넌트가 언마운트될 때 타이틀을 원래대로 복원합니다.
    return () => {
      document.title = 'Venezia';
    };
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // 인증되지 않았으면 로그인 페이지를 보여줍니다.
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  // 인증되었으면 관리자 대시보드를 보여줍니다.
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <AdminMenu />
      <main className="admin-main-content" style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        <Routes>
          <Route path="fall-duration" element={<EditFallDuration />} />
          <Route path="spawn-interval" element={<EditSpawnInterval />} />
          <Route path="clear-word-count" element={<EditClearWordCount />} />
          <Route path="manage-words" element={<ManageWords />} />
          <Route path="manage-users" element={<ManageUsers />} />
          <Route index element={<div>관리자 페이지입니다. 메뉴를 선택해주세요.</div>} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminLayout;

