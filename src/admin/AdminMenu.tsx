import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminMenu: React.FC = () => {
  const activeStyle = { fontWeight: 'bold', color: '#0000A8' };

  return (
    <aside style={{ width: '250px', borderRight: '2px solid #848484', padding: '20px' }}>
      <h2 style={{ marginTop: 0 }}>관리자 메뉴</h2>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '10px' }}>
            <NavLink 
              to="/admin/fall-duration" 
              style={({ isActive }) => isActive ? activeStyle : { textDecoration: 'none' }}
            >
              하강 시간 (fall_duration)
            </NavLink>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <NavLink 
              to="/admin/spawn-interval" 
              style={({ isActive }) => isActive ? activeStyle : { textDecoration: 'none' }}
            >
              출현 속도 (spawn_interval)
            </NavLink>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <NavLink 
              to="/admin/clear-duration" 
              style={({ isActive }) => isActive ? activeStyle : { textDecoration: 'none' }}
            >
              게임 시간 (clear_duration)
            </NavLink>
          </li>
        </ul>
      </nav>
      <hr style={{ margin: '20px 0' }} />
      <NavLink to="/" style={{ textDecoration: 'none' }}>
        &larr; 게임 홈으로 돌아가기
      </NavLink>
    </aside>
  );
};

export default AdminMenu;
