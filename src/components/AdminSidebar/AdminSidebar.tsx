import './AdminSidebar.css';
import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { RootState } from '../../redux/store';
import { toggleSidebar } from '../../redux/sidebarCollapseSlice';

const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;


function AdminSidebar() {

  const sidebarCollapsed = useTypedSelector(state => state.sidebarCollapse.value);
  const dispatch = useDispatch()


  return (
    <>
    <div className={`admin-sidebar ${sidebarCollapsed ? 'admin-sidebar-collapsed' : ''}`}>    
    <button onClick={()=> dispatch(toggleSidebar())} className='btn-toggle'><i className="bi bi-list"></i></button>
          <ul>
            <NavLink to='/admin/dashboard'>
              <li>
              <i className="bi bi-speedometer"></i>       
                Dashboard
              </li>
            </NavLink>
            <NavLink to='/admin/users'>
              <li>
              <i className="bi bi-people-fill"></i>
                Users
              </li>
            </NavLink>
            <NavLink to='/admin/programs'>
              <li>
              <i className="bi bi-code-slash"></i>
                Programs
              </li>
            </NavLink>
            <NavLink to='/admin/subscriptions'>
              <li>
              <i className="bi bi-ticket-detailed"></i>
                Subscription Plans
              </li>
            </NavLink>
            {/* <NavLink to='/admin/enquiries'>
            <li>
            <i className="bi bi-envelope-arrow-down-fill"></i>
              Enquiries
            </li>
            </NavLink> */}
            <NavLink to='/admin/workspaces'>
              <li>
              <i className="bi bi-person-workspace"></i>
                Workspaces and Projects
              </li>
            </NavLink>
          </ul>
    </div>
    </>
  )
}

export default AdminSidebar