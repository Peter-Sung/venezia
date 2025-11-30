import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { updateHighScore, logGameResult } from '../lib/queries';
import { GameSession } from '../domains/game/session';

interface GuestSignupModalProps {
    score: number;
    virtualRank?: number | null;
    onClose: () => void;
    onSuccess: (newSession: GameSession) => void;
}

const GuestSignupModal: React.FC<GuestSignupModalProps> = ({ score, virtualRank, onClose, onSuccess }) => {
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        // 1. Validation
        if (nickname.length < 2) {
            setError('닉네임이 너무 짧아요.');
            setIsSubmitting(false);
            return;
        }
        if (password.length < 6) {
            setError('비밀번호는 6자 이상이어야 해요.');
            setIsSubmitting(false);
            return;
        }

        // 2. Register
        const { error: funcError } = await supabase.functions.invoke('register-player', {
            body: { nickname, password },
        });

        if (funcError) {
            const errorBody = await funcError.context.json();
            if (errorBody.error === 'Nickname already exists.') {
                setError('이미 사용중인 닉네임이에요.');
            } else {
                setError('회원가입 실패. 다시 시도해주세요.');
            }
            setIsSubmitting(false);
            return;
        }

        // 3. Login (to get token and ID)
        const { data: loginData, error: loginError } = await supabase.functions.invoke('login-player', {
            body: { nickname, password },
        });

        if (loginError || !loginData?.token) {
            setError('가입은 되었으나 로그인에 실패했습니다.');
            setIsSubmitting(false);
            return;
        }

        // 4. Save Token & Create Session
        const token = loginData.token;
        localStorage.setItem('venezia_token', token);

        // Decode token to get ID
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decoded = JSON.parse(jsonPayload);
        const playerId = decoded.sub;

        // 5. Submit Score
        try {
            const playAt = new Date().toISOString();
            await logGameResult({ playerId, score, playAt });
            await updateHighScore({ nickname, play_at: playAt, score });
        } catch (err) {
            console.error('Score submission failed:', err);
            // Even if score submission fails, we are logged in.
        }

        // 6. Notify Success
        onSuccess({
            playerId,
            nickname,
            isGuest: false,
        });
    };

    return (
        <div className="retro-overlay" style={{ zIndex: 9500 }}>
            <div className="retro-modal" style={{ zIndex: 9501 }}>
                <div className="retro-window" style={{ width: '400px' }}>
                    <div className="retro-titlebar" style={{ justifyContent: 'space-between' }}>
                        <span>점수 저장 및 회원가입</span>
                        <button className="retro-button-icon" onClick={onClose}>X</button>
                    </div>
                    <div className="retro-window__body">
                        <p style={{ textAlign: 'center', marginBottom: '20px' }}>
                            가입하면 <span style={{ color: 'blue' }}>{score.toLocaleString()}점</span>이 저장됩니다!<br />
                            (전체 랭킹: <span style={{ color: 'red' }}>{virtualRank ? `${virtualRank}위` : '...'}</span> 예상)
                        </p>
                        <form onSubmit={handleSignUp} className="bevel-inset" style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }} autoComplete="off">
                            {error && <p style={{ color: 'red', fontSize: '14px', margin: 0 }}>{error}</p>}
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px' }}>닉네임</label>
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    className="retro-input"
                                    style={{ width: '100%' }}
                                    disabled={isSubmitting}
                                    autoComplete="off"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px' }}>비밀번호</label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="retro-input"
                                        style={{ width: '100%', paddingRight: '35px' }}
                                        disabled={isSubmitting}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '5px',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '16px',
                                            padding: '5px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        title={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                                    >
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                            </div>
                            <button type="submit" className="retro-button bevel-outset" style={{ marginTop: '10px', padding: '10px' }} disabled={isSubmitting}>
                                {isSubmitting ? '처리 중...' : '가입하고 점수 저장'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuestSignupModal;
