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
    <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        fontFamily: 'var(--font-family-pixel)',
        background: 'var(--color-primary-cyan)'
    }}>
      <form 
        onSubmit={handleLogin} 
        style={{ 
            background: 'var(--color-neutral-gray-medium)',
            padding: 'var(--spacing-lg)',
            borderTop: 'var(--border-width-md) solid var(--color-border-light)',
            borderLeft: 'var(--border-width-md) solid var(--color-border-light)',
            borderRight: 'var(--border-width-md) solid var(--color-border-dark)',
            borderBottom: 'var(--border-width-md) solid var(--color-border-dark)',
            textAlign: 'center',
            width: '400px'
        }}
      >
        <h3 style={{ 
            fontSize: 'var(--font-size-lg)', 
            color: 'var(--color-text-primary)',
            marginTop: 0,
            marginBottom: 'var(--spacing-lg)'
        }}>
            관리자 로그인
        </h3>
        
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="암호를 입력하세요"
          style={{
            fontSize: 'var(--font-size-md)',
            padding: 'var(--spacing-sm)',
            fontFamily: 'inherit',
            borderTop: 'var(--border-width-sm) solid var(--color-border-dark)',
            borderLeft: 'var(--border-width-sm) solid var(--color-border-dark)',
            borderRight: 'var(--border-width-sm) solid var(--color-border-light)',
            borderBottom: 'var(--border-width-sm) solid var(--color-border-light)',
            outline: 'none',
            width: 'calc(100% - 2 * var(--spacing-sm))',
            marginBottom: 'var(--spacing-md)'
          }}
        />
        <button 
          type="submit" 
          disabled={isLoading}
          style={{
            fontSize: 'var(--font-size-md)',
            padding: 'var(--spacing-sm) var(--spacing-lg)',
            fontFamily: 'inherit',
            color: 'var(--color-text-primary)',
            background: 'var(--color-neutral-gray-medium)',
            cursor: 'pointer',
            width: '100%',
            borderTop: 'var(--border-width-sm) solid var(--color-border-light)',
            borderLeft: 'var(--border-width-sm) solid var(--color-border-light)',
            borderRight: 'var(--border-width-sm) solid var(--color-border-dark)',
            borderBottom: 'var(--border-width-sm) solid var(--color-border-dark)',
          }}
        >
          {isLoading ? '확인 중...' : '로그인'}
        </button>

        {error && <p style={{ color: 'red', marginTop: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)' }}>{error}</p>}
      </form>
    </div>
  );
};

export default AdminLogin;
