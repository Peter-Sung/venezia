
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../tokens.css';

// JWT payload에서 추출할 프로필 정보 타입
interface Profile {
  id: string;
  nickname: string;
}

// 부모 컴포넌트로 전달할 props 타입
interface WelcomeProps {
  onGameStart: (profile: Profile, stage: number) => void;
}

// Base64 URL 디코딩을 포함한 간단한 JWT 디코더
const decodeJwt = (token: string): any | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};


const Welcome: React.FC<WelcomeProps> = ({ onGameStart }) => {
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginView, setIsLoginView] = useState(true);

  // Form states
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [signupNickname, setSignupNickname] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedStage, setSelectedStage] = useState(1);
  const [error, setError] = useState('');

  // 로드 시 localStorage에서 토큰을 확인하여 자동 로그인 처리
  useEffect(() => {
    const storedToken = localStorage.getItem('venezia_token');
    if (storedToken) {
      const decoded = decodeJwt(storedToken);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setToken(storedToken);
        setProfile({ id: decoded.sub, nickname: decoded.nickname });
      } else {
        localStorage.removeItem('venezia_token');
      }
    }
    setLoading(false);
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const isKorean = (text: string) => /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text);

    if (isKorean(signupNickname)) {
      if (signupNickname.length < 2) {
        setError('닉네임이 너무 짧아요. (한글 2자/영문 4자 이상)');
        setIsSubmitting(false);
        return;
      }
    } else { // Assume English or other non-Korean characters
      if (signupNickname.length < 4) {
        setError('닉네임이 너무 짧아요. (한글 2자/영문 4자 이상)');
        setIsSubmitting(false);
        return;
      }
    }

    if (signupPassword.length < 6) {
      setError('비밀번호가 너무 짧아요. (최소 6자 이상)');
      setIsSubmitting(false);
      return;
    }

    const { error: funcError } = await supabase.functions.invoke('register-player', {
      body: { nickname: signupNickname, password: signupPassword },
    });

    if (funcError) {
      const errorBody = await funcError.context.json();
      const errorMessage = errorBody.error;
      if (errorMessage === 'Nickname already exists.') {
        setError('이미 사용중인 닉네임이에요.');
      } else {
        setError('회원가입에 실패했습니다. 다시 시도해주세요.');
      }
      setIsSubmitting(false);
      return;
    }

    // Success
    alert('회원가입이 완료되었습니다! 이제 로그인해주세요.');
    handleViewChange(true);
    setIsSubmitting(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const { data, error: funcError } = await supabase.functions.invoke('login-player', {
      body: { nickname, password },
    });

    if (funcError) {
      const errorBody = await funcError.context.json();
      const errorMessage = errorBody.error;
      if (errorMessage === 'Nickname not found.') {
        setError('등록되지 않은 닉네임이에요.');
      } else if (errorMessage === 'Incorrect password.') {
        setError('비밀번호가 맞지 않아요.');
      } else {
        setError('로그인에 실패했습니다. 다시 시도해주세요.');
      }
      setIsSubmitting(false);
      return;
    }

    if (!data?.token) {
      console.error('Login failed: No token received');
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
      setIsSubmitting(false);
      return;
    }

    const newToken = data.token;
    const decoded = decodeJwt(newToken);
    if (!decoded) {
      console.error('Login failed: Invalid token received');
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
      setIsSubmitting(false);
      return;
    }

    localStorage.setItem('venezia_token', newToken);
    setToken(newToken);
    setProfile({ id: decoded.sub, nickname: decoded.nickname });
    setIsSubmitting(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('venezia_token');
    setToken(null);
    setProfile(null);
  };

  const handleViewChange = (isLogin: boolean) => {
    setIsLoginView(isLogin);
    setError('');
  };

  const handleGameStart = () => {
    if (profile) {
      onGameStart(profile, selectedStage);
    } else {
      alert('로그인이 필요합니다.');
    }
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="bevel-inset" style={{ padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <legend style={{ color: 'var(--color-primary-blue-deep)', padding: 0, border: 0 }}>로그인</legend>
        {isSubmitting ? (
          <p style={{ color: 'red', margin: 0, fontSize: '14px' }}>로그인 중..</p>
        ) : (
          error && <p style={{ color: 'red', margin: 0, fontSize: '14px' }}>{error}</p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 'var(--spacing-sm)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', flex: '1 1 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <label htmlFor="nickname-input" style={{ minWidth: '110px' }}>닉네임:</label>
            <input id="nickname-input" type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} className="retro-input bevel-inset" required disabled={isSubmitting} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <label htmlFor="password-input" style={{ minWidth: '110px' }}>비밀번호:</label>
            <input id="password-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="retro-input bevel-inset" required disabled={isSubmitting} />
          </div>
        </div>
        <button type="submit" className="retro-button bevel-outset" style={{ flex: '0 0 auto', width: '83px', height: '83px' }} disabled={isSubmitting}>
          {isSubmitting ? '...' : '로그인'}
        </button>
      </div>
      <p style={{ textAlign: 'center', margin: '0', fontSize: '14px' }}>
        계정이 없으신가요? <button type="button" onClick={() => handleViewChange(false)} className="retro-button-inline bevel-outset" disabled={isSubmitting}>회원가입</button>
      </p>
    </form>
  );

  const renderSignUpForm = () => (
    <form onSubmit={handleSignUp} className="bevel-inset" style={{ padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <legend style={{ color: 'var(--color-primary-blue-deep)', padding: 0, border: 0 }}>회원가입</legend>
        {isSubmitting ? (
          <p style={{ color: 'red', margin: 0, fontSize: '14px' }}>회원가입 중..</p>
        ) : (
          error && <p style={{ color: 'red', margin: 0, fontSize: '14px' }}>{error}</p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 'var(--spacing-sm)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', flex: '1 1 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <label htmlFor="nickname-signup" style={{ minWidth: '110px' }}>닉네임:</label>
            <input id="nickname-signup" type="text" value={signupNickname} onChange={(e) => setSignupNickname(e.target.value)} className="retro-input bevel-inset" required disabled={isSubmitting} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <label htmlFor="password-signup" style={{ minWidth: '110px' }}>비밀번호:</label>
            <input id="password-signup" type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} className="retro-input bevel-inset" required disabled={isSubmitting} />
          </div>
        </div>
        <button type="submit" className="retro-button bevel-outset" style={{ flex: '0 0 auto', width: '83px', height: '83px' }} disabled={isSubmitting}>
          {isSubmitting ? '...' : <>회원<br />가입</>}
        </button>
      </div>
      <p style={{ textAlign: 'center', margin: '0', fontSize: '14px' }}>
        이미 계정이 있으신가요? <button type="button" onClick={() => handleViewChange(true)} className="retro-button-inline bevel-outset" disabled={isSubmitting}>로그인</button>
      </p>
    </form>
  );

  const renderLoggedInView = () => (
    <div className="bevel-inset" style={{ padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      <p style={{ margin: '0', textAlign: 'center', fontSize: '18px' }}>
        환영합니다. <span style={{ color: 'red', fontWeight: 'normal' }}>{profile?.nickname}</span> 님!
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
        <label htmlFor="stage-select" style={{ minWidth: '80px' }}>단계선택:</label>
        <select id="stage-select" value={selectedStage} onChange={(e) => setSelectedStage(Number(e.target.value))} className="retro-input bevel-inset" style={{ flex: 1 }}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map(level => (
            <option key={level} value={level}>{level}단계</option>
          ))}
        </select>
      </div>
    </div>
  );

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="welcome-container">
      <div className="retro-window" style={{ width: '480px', margin: '0 auto' }}>
        <div className="retro-titlebar" style={{ justifyContent: 'center' }}>★☆★    베네치아    ★☆★</div>
        <div className="retro-window__body p-lg" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)', fontSize: '18px' }}>
          {profile ? renderLoggedInView() : (isLoginView ? renderLoginForm() : renderSignUpForm())}
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-md)', paddingTop: 'var(--spacing-sm)', borderTop: '1px solid var(--color-border-dark)', marginTop: 'var(--spacing-sm)' }}>
            {profile && (
              <button onClick={handleGameStart} className="retro-button bevel-outset" style={{ minWidth: '120px' }}>
                게임하기
              </button>
            )}
            <button onClick={() => alert('열심히 만들고 있어요!')} className="retro-button bevel-outset" style={{ minWidth: '120px' }}>
              랭킹조회
            </button>
            {profile && (
              <button onClick={handleLogout} className="retro-button bevel-outset" style={{ minWidth: '120px' }}>
                로그아웃
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="welcome-footer">
        © 2025 Venezia: Finger Stretching (by Peter Labs). All rights reserved.
      </div>
    </div>
  );
};

export default Welcome;
