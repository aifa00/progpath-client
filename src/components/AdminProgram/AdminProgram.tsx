import './AdminProgram.css';
import { ChangeEvent, useEffect, useState } from 'react'
import AdminSidebar from '../AdminSidebar/AdminSidebar'

import { Link } from 'react-router-dom'
import axios from '../../axiosConfig'
import { useDispatch } from 'react-redux'
import { setAlert } from '../../redux/alertSlice'
import ViewProgram from '../ViewProgram/ViewProgram';
import Dialog from '../../assets/Dialog';
import Pagination from '../Pagination/Pagination';

interface ProgramType {
  _id: string,
  slno: number,
  title: string,
  timestamp: string,
  publishedBy: {
    username: string
  },
  status: string
}

function AdminProgram() {

  const [search, setSearch] = useState('');
  const [programs, setPrograms] = useState<ProgramType[]>([]);
  const [page, setPage] = useState<number>(1);
  const [sort, setSort] = useState<string>('');
  const [order, setOrder] = useState<string>('');
  const [filterBy, setFilterBy] = useState<string>('');
  const [programId, setProgramId] = useState<string>('');
  const [viewProgram, setViewProgram] = useState<boolean>(false);
  const [totalResults, setTotalResult] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [deleteDialog, setDeleteDialog] = useState({
    header: '',
    message: '',
    toDelete: false,
    onCancel: () => {},
    onSuccess: () => {}
  });

  const dispatch = useDispatch();

  useEffect (() => {

    const fetchPrograms = async () => {
      try {
        const { data } = await axios.get(`/admin/programs`, {
          params: {
            sort,
            order,
            filterBy,
            page,
            search
          }
        })
        if (data.success) {
          setPrograms(data.programs);
          setTotalResult(data.totalResults);
          setTotalPages(data.totalPages);
        }
  
      } catch (error) {
        console.log(error);
        
      }
    }

    fetchPrograms();

  }, [search, filterBy, sort, order, page]);


  const handleFilterChange = (e:ChangeEvent<HTMLSelectElement>) => {
    const filterValue = e.target.value;
    setFilterBy(filterValue);
  };
  

  const handleSortChange = (e:ChangeEvent<HTMLSelectElement>) => {
    const sortValue = e.target.value;
    
    if (sortValue) {
      const [sortField, sortOrder] = e.target.value.split('-');
      setSort(sortField);
      setOrder(sortOrder);

    } else {
      setSort('')
      setOrder('')
    }    
  };

  const handleChangeStatus = async (programId:string, status:string) => {
    try {        
      const { data } = await axios.post(`/admin/programs/${programId}/status`, {
        status
      });

      if (data.success) {
        dispatch(setAlert({message: 'Status updated!', type: 'success'}));
        setPrograms ((prev:any) => (
          [...prev].map((program: any) => {
            if (program._id === programId) {
              return {...program, status}
            } else {
              return program
            }
          })
        ))
      }

    } catch (error) {
      console.log(error);        
    }
  }

  const handleDeleteProgram = async (e: any, programId:string) => {
    e.preventDefault();
    setDeleteDialog({
        header: 'Delete Program ?',
        message: 'Are you sure you want to delete this program?',
        toDelete: true,
        onCancel: () => {
          setOpenDeleteDialog(false);
        },
        onSuccess: async () => {
            try {                
                setOpenDeleteDialog(false);

                setPrograms((prevPrograms:any) => (
                  [...prevPrograms].filter((p) => p._id !== programId)
                ))

                const { data } = await axios.delete(`/admin/programs/${programId}`);

                if (data.success) {
                  dispatch(setAlert({message: 'Delete was succesful', type: 'success'}));                                    
                }
            } catch (error) {
              setPrograms([...programs]);
              console.log(error);
            }
        }
    });
    setOpenDeleteDialog(true);
  }

  const openProgram = (e: any, programId: string) => {
    setProgramId(programId);
    document.body.classList.add('modal-open');
    setViewProgram(true);
  }

  const getStatusColor = (status: string) => {
    if (status === 'accepted') return 'var(--color-success)'
    if (status === 'rejected') return 'var(--color-error)'
    if (status === 'pending') return 'var(--color-warning)'
  }

  return (
    <>
    <div className='admin-programs'>
        <AdminSidebar/>
        <div className='container'>

          <h5>PROGRAMS</h5>          

          <div className='search-filter-sort'>            
            <input 
              type="search" 
              placeholder='search...' 
              className='search'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />    
            <select className='filter' onChange={handleFilterChange}>
              <option value="">Filter</option>
              <option value="week">past 7 days</option>
              <option value="month">past 30 days</option>
              <option value="year">past 1 year</option>
              <option value="pending">status-pending</option>
              <option value="accepted">status-accepted</option>
              <option value="rejected">status-rejected</option>
            </select>
            <select className='filter' onChange={handleSortChange}>
              <option value="">Sort</option>
              <option value="title-asce">Title - Ascending</option>
              <option value="title-desc">Title - Descending</option>              
              <option value="date-asce">Date - Ascending</option>
              <option value="date-desc">Date - Descending</option>   
            </select>          
          </div>
                    
          <div className='table'>
          <table>
              <thead>
                  <tr>
                    <th>No</th>
                    <th>Title</th>
                    <th>Published <br /> On</th>
                    <th>Published <br /> By</th>                  
                    <th>Status</th>
                    <th>Action</th> 
                  </tr>
              </thead>
              <tbody>
              {
                programs.length > 0 ? (
                  programs.map ((program:any) => (
                    <tr key={program._id}>
                      <td>{program.slno}</td>                    
                      <td><strong>{program?.title?.toUpperCase()}</strong></td>
                      <td>{new Date(program.timestamp).toLocaleDateString('en-GB')}</td>
                      <td>{program.publishedBy.username}</td>                      
                      <td><strong style={{color: getStatusColor(program.status)}}>{program.status}</strong></td>                    
                      <td>
                        <button>
                          <select defaultValue={program.status} onChange={(e) => handleChangeStatus(program._id, e.currentTarget.value)}>
                              <option value="pending">Pending</option>
                              <option value="rejected">Rejected</option>
                              <option value="accepted">Accepted</option>
                          </select>
                        </button>
                        <Link to='#' onClick={(e) => openProgram(e, program._id)}>view</Link>
                        <Link to='#' onClick={(e) => handleDeleteProgram(e, program._id)}>Delete</Link>
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
            programs.length > 0 && (
              <Pagination
                from={programs[0]?.slno || 0}
                to={programs[programs.length - 1]?.slno || 0}
                totalResults={totalResults}
                page={page}
                totalPages={totalPages}
                setPage={setPage}
              />
            )
          }    
          </div>
        </div>
        
        {viewProgram &&
          <ViewProgram programId={programId} setViewProgram={setViewProgram} setPrograms={setPrograms}/>
        }
        {
          openDeleteDialog && (
          <Dialog
          header={deleteDialog.header}
          message={deleteDialog.message}
          toDelete={deleteDialog.toDelete}
          onCancel={deleteDialog.onCancel}
          onSuccess={deleteDialog.onSuccess}
          />)
        }
    </div>
    </>
  )
}

export default AdminProgram