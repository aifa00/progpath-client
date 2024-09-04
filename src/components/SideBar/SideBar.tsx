import './SideBar.css';
import { NavLink } from 'react-router-dom'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { toggleSidebar } from '../../redux/sidebarCollapseSlice';
import { togglePremiumComponent } from '../../redux/premiumSlice';

const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

function SideBar() {

  const sidebarCollapsed = useTypedSelector(state => state.sidebarCollapse.value);
  const dispatch = useDispatch()

  return (
    <>
    <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className='upper'>  

          <button onClick={()=> dispatch(toggleSidebar())} className='btn-toggle'>       
            <i className={sidebarCollapsed ? "fa-solid fa-chevron-right" : "fa-solid fa-chevron-left"}></i>
          </button>

          <ul>
            <NavLink to={'/'}>
              <li>
              <i className="fa-solid fa-house"></i>
                <p>Home</p>
              </li>
            </NavLink>
            <NavLink to={'/workspaces'}>
              <li>
              <i className="fa-solid fa-users"></i>
                <p>Workspace</p>
              </li>
            </NavLink>
            <NavLink to={'/marketplace'}>
              <li>
              <i className="fa-solid fa-comments-dollar"></i>
                <p>Marketplace</p>
              </li>
            </NavLink>            
          </ul>
      </div>        
        <div className='lower'>
          <ul>           
            <li style={{border: 'none'}} onClick={() => dispatch(togglePremiumComponent())}>
                <i className="bi bi-gem"></i>
                <p>Progpath Premium</p>
              </li>
          </ul>
        </div>
    </div>
    </>
  )
}

export default SideBar