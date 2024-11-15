import './AdminHeader.css';
import { useState } from 'react';
import Logo from '../../assets/Logo';
import { removeUser } from '../../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import axios from '../../axiosConfig';
import { getEmail } from '../../utils/jwtUtils';
import { toggleSidebar } from '../../redux/sidebarCollapseSlice';
import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';


const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;


function AdminHeader() {

    const sidebarCollapsed = useTypedSelector(state => state.sidebarCollapse.value);

    const [dropdown, setDropDown] = useState(false);
    const [email] = useState(getEmail());
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
      try {
        setDropDown(false);
        const res = await axios.post('/admin/logout');
        
        if (res.data.success) {
          localStorage.removeItem('token');
          dispatch(removeUser());
          navigate('/admin/login');
        }
      } catch (error) {
        console.log(error);
      }
    }

  return (
    <div className='admin-header'>
        {sidebarCollapsed && <button onClick={()=> dispatch(toggleSidebar())} className='btn-toggle-collapsed'><i className="bi bi-list"></i></button>}
        <div className='header-left' onClick={() => navigate('/admin/dashboard')}>
          <Logo/>
        </div>
        <div className='header-right'>
          { email && <h5>{email}</h5>}
          <button  onClick={() => setDropDown(!dropdown)}>
            <i className="fa-solid fa-user fa-2xl"></i>
          </button>          
          {
            dropdown && (
            <div onMouseLeave={() => setDropDown(!dropdown)} onClick={handleLogout} className='dropdown-menu'>            
              <div className='dropdown-option'>                
                <i className="bi bi-power"></i> &nbsp;
                <span>Logout</span>
              </div>
            </div>
            )
          }
        </div>
    </div>
  )
}

export default AdminHeader