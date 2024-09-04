import React, { ChangeEvent, useEffect, useState } from 'react';
import './AdminWorkspace.css'
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import { useDispatch } from 'react-redux';
import axios from '../../axiosConfig';
import Pagination from '../Pagination/Pagination';
import { setAlert } from '../../redux/alertSlice';

function AdminWorkspace() {

  const [workspaces, setWorkspaces] = useState<any>([]);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');  
  const [sortBy, setSortBy] = useState('');
  const [order, setOrder] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWorkspaces, setTotalWorkspaces] = useState(0);
  const [analytics, setAnalytics] = useState({
    total_workspaces: 0,
    total_projects: 0,
    total_tasks: 0
  });
  const dispatch = useDispatch();

  useEffect (() => {

    const fetchUsers = async () => {
      try {
        const { data } = await axios.get('/admin/workspaces', {
          params: {
            search,
            startDate,
            endDate,            
            sortBy,
            order,
            page,
          },
        });
        
        if (data.success) {          
          setWorkspaces(data.workspaces);
          setTotalPages(data.totalPages);
          setTotalWorkspaces(data.totalWorkspaces);
          setAnalytics(data.analytics);
        }

      } catch (error) {
        console.log(error);        
      }
    }
    fetchUsers();

  }, [search, endDate, sortBy, order, page]);

  const handleSearchChange = (e:ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);

  const handleFilterChange = (e:ChangeEvent<HTMLSelectElement>) => {
    const filterValue = e.target.value;
    const currentDate = new Date();
    let start = '';
    let end = currentDate.toISOString();
  
    if (filterValue === 'week') {
      const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - 7));
      start = startOfWeek.toISOString();
    } else if (filterValue === 'month') {
      const startOfMonth = new Date(currentDate.setDate(currentDate.getDate() - 30));
      start = startOfMonth.toISOString();
    } else if (filterValue === 'year') {
      const startOfYear = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1));
      start = startOfYear.toISOString();
    }
  
    setStartDate(start);
    setEndDate(end);
  };
  

  const handleSortChange = (e:ChangeEvent<HTMLSelectElement>) => {
    const [sortField, sortOrder] = e.target.value.split('-');
    setSortBy(sortField);
    setOrder(sortOrder);
  };


  const handleActionFreeze = async (workspaceId:string, action:string) => {
    try {
      setWorkspaces ((prevWorkspaces:any) => (
        [...prevWorkspaces].map((workspace:any) => {
          if (workspace._id === workspaceId) {
            return {...workspace, freezed: !workspace.freezed}
          } else {
            return workspace
          }
        })
      ))

      const { data } = await axios.post(`/admin/workspaces/${workspaceId}/freez`, {
        action
      });      

      if (data.success) {
        dispatch(setAlert({message: `Workspace ${action === 'freez' ? 'Freezed' : 'Unfreezed'} successfully`, type: 'success'}))
      }

    } catch (error) {
      setWorkspaces([...workspaces])
      console.log(error);        
    }
  }

  return (
    <>
    <div className='admin-workspace'>
        <AdminSidebar/>
        <div className='container'>

          <h5>WORKSPACES AND PROJECTS</h5>

          <div className='upper-row'>
            <div>
              <h4>TOTAL WORKSPACES</h4>
              <h4>{analytics.total_workspaces}</h4>
            </div>
            <div>
              <h4>TOTAL PROJECTS</h4>
              <h4>{analytics.total_projects}</h4>
            </div>
            <div>
              <h4>TOTAL TASKS</h4>
              <h4>{analytics.total_tasks}</h4>
            </div>
          </div>

          <div className='search-filter-sort'>
            <input 
              type="search" 
              placeholder='search...' 
              className='search'
              value={search}
              onChange={handleSearchChange}
            />
            <select className='filter' onChange={handleFilterChange}>
              <option value="">Filter</option>
              <option value="week">past 7 days</option>
              <option value="month">past 30 days</option>
              <option value="year">past 1 year</option>
            </select>
            <select className='filter' onChange={handleSortChange}>
              <option value="">Sort</option>
              <option value="title-asc">Title - Ascending</option>
              <option value="title-desc">Title - Descending</option>
              <option value="admin-asc">Created By - Ascending</option>
              <option value="admin-desc">Created By - Descending</option>
              <option value="date-asc">Date - Ascending</option>
              <option value="date-desc">Date - Descending</option>
              <option value="numOfCollaborators-asc">No.of Collaborators - Ascending</option>
              <option value="numOfCollaborators-desc">No.of Collaborators - Descending</option>
              <option value="numOfProjects-asc">No.of Projects - Ascending</option>
              <option value="numOfProjects-desc">No.of Projects - Descending</option>
              <option value="numOfTasks-asc">No.of Tasks - Ascending</option>
              <option value="numOfTasks-desc">No.of Tasks - Descending</option>
            </select>          
          </div>
          
          <div className='table'>
          <table>
              <thead>
                  <tr>
                    <th>No</th>
                    <th>Workspace Name</th>
                    <th>Created By</th>
                    <th>Created On</th>
                    <th>Number of <br />Collaborators</th>
                    <th>Number of <br />Projects</th>
                    <th>Number of <br />Tasks</th>   
                    <th>Action</th>                
                  </tr>
              </thead>
              <tbody>
              {
                workspaces.length > 0 ? (
                  workspaces.map ((workspace:any) => (
                    <tr key={workspace._id}>
                      <td>{workspace.slno}</td>                    
                      <td>{workspace.title}</td>
                      <td>{workspace.createdBy.username}</td>
                      <td>{new Date(workspace.timestamp).toLocaleDateString('en-GB')}</td>
                      <td>{workspace.collaboratorsCount}</td>
                      <td>{workspace.projectsCount}</td>
                      <td>{workspace.tasksCount}</td>
                      <td>                     
                        <button 
                        className='freez-button' 
                        onClick={() => handleActionFreeze(workspace._id, workspace.freezed ? 'unfreez' : 'freez')}>
                          {workspace.freezed === true ? 'Unfreez' : 'Freez'}                          
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8}>NO DATA FOUND</td>
                  </tr>
                )
              }
              </tbody>              
          </table>
          {
            workspaces.length > 0 && (
              <Pagination 
              from={workspaces[0].slno} 
              to={workspaces[workspaces.length - 1].slno} 
              totalResults={totalWorkspaces} 
              page={page} 
              totalPages={totalPages}
              setPage={setPage}
              />
            )
          }
          </div>
        </div>
    </div>
    </>
  )
}

export default AdminWorkspace