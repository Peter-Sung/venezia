import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.functions.invoke('verify-admin-password', {
        body: JSON.stringify({ password }),
      });

      if (error) throw error;

      if (data.success) {
        // sessionStorage에 인증 상태 저장
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        onLoginSuccess();
      } else {
        setError('암호가 올바르지 않습니다.');
      }
    } catch (err: any) {
      setError(`로그인 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <form onSubmit={handleLogin}>
        <h3>관리자 로그인</h3>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="암호를 입력하세요"
          style={{ marginRight: '10px' }}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? '확인 중...' : '로그인'}
        </button>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </form>
    </div>
  );
};

export default AdminLogin;
