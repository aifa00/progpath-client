import './AdminDashBoard.css';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import BarChart from '../../assets/BarChart';
import { ChartData } from 'chart.js';
import PieChart from '../../assets/PieChart';
import { useEffect, useState } from 'react';
import axios from '../../axiosConfig';
import { useDispatch } from 'react-redux';
import { setAlert } from '../../redux/alertSlice';

interface ResultType {
  totalRevenue: number
  totalUsers: number
  currentPremiumUsers: number
  monthlyRevenue: number[]
  monthlyUserSignIns: number[]
  userRoleNumbers: number[]
  premiumUsers: {
    _id: string, 
    totalSubscriptions: number
  }[]
}

function AdminDashBorad() {

  const [result, setResult] = useState<ResultType | {}>({});  
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [selectedDateOption, setSelectedDateOption] = useState<string>('');
  const [yearsDropdown, setYearsDropdown] = useState<boolean>(false);
  const [customDateDropdown, setCustomDateDropdown] = useState<boolean>(false);
  const dispatch = useDispatch();

  const currentYear = new Date().getFullYear(); // Get the current year
  const startYear = 2024;
  const years = [];

  // Create an array of years from startYear to currentYear
  for (let i = startYear; i <= currentYear; i++) {
    years.push(i);
  }  

  useEffect (() => {

    const fetchData = async () => {
      try {
        const { data } = await axios.get('/admin/dashboard', {
          params: {
            dateFrom: startDate,
            dateTo: endDate
          }
        });

        if (data.success) {
          setResult(data.result);          
        }
      } catch (error) {
        console.log(error);        
      }
    }
    fetchData()
  },[endDate])


  const revenueChartData:ChartData<'bar'> = {
    labels: ['Jan', 'Feb','Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
        {
          label: 'REVENUE',
          data: (result as ResultType).monthlyRevenue || Array(12).fill(0),
          backgroundColor: 'rgba(255, 99, 132, 0.6)',              
        }
    ]
  };

  const signInChartData:ChartData<'bar'> = {
    labels: ['Jan', 'Feb','Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
        {
          label: 'USER SIGN-INS',
          data: (result as ResultType).monthlyUserSignIns || Array(12).fill(0),
          backgroundColor: '#77C3EC',
          borderRadius: 5,
          borderWidth: 3,
          borderColor: 'gray'
        }
    ]
  };

  const userRoleChartData:ChartData<'pie'> = {
    labels: ['TEAMLEAD', 'REGULAR'],
    datasets: [{
      //label order:  regular, teamlead      
      data: (result as ResultType).userRoleNumbers || Array(2).fill(0),
      backgroundColor: [
        'rgba(221, 160, 221, 0.6)', 
        'rgba(175, 238, 238, 0.6)',
      ],
      hoverOffset: 4
    }]
  };

  const premiumChartData:ChartData<'pie'> = {
    labels: (result as ResultType).premiumUsers?.map((data) => data._id),
    datasets: [{
      data: (result as ResultType).premiumUsers?.map((data) => data.totalSubscriptions),
      backgroundColor: [
        'rgba(173, 216, 230, 0.6)',
        'rgba(144, 238, 144, 0.6)',
        'rgba(255, 182, 193, 0.6)',
      ],
      hoverOffset: 4
    }]
  };

  
  const filterByDate = (option: string) => {
    if (!option) return;

    let currentDate = new Date();
    let startDate = ''
    let endDate = currentDate.toISOString();

    if (option === 'past30days') {
      if(yearsDropdown) setYearsDropdown(false);
      if(customDateDropdown) setCustomDateDropdown(false);
      setSelectedDateOption(option)
      const thirtyDaysBefore = new Date(currentDate.setDate(currentDate.getDate() - 30));
      startDate = thirtyDaysBefore.toISOString();

    } else if (option === 'past12months') {
      if(yearsDropdown) setYearsDropdown(false);
      if(customDateDropdown) setCustomDateDropdown(false);
      setSelectedDateOption(option)
      const twelveMonthsBefore  = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1));
      startDate = twelveMonthsBefore.toISOString();

    } else if (option.startsWith('year')) {
      setSelectedDateOption(option)

      const [_, year] = option.split('-');
      const givenYear = parseInt(year);
  
      const startOfYear = new Date(givenYear, 0, 1);
      const endOfYear = new Date(givenYear, 11, 31, 23, 59, 59, 999);

      startDate = startOfYear.toISOString()
      endDate = endOfYear.toISOString()
    } else {
      const currentYear = currentDate.getFullYear();
      startDate = new Date(currentYear, 0, 1).toISOString();
      endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999).toISOString();
    }

    setStartDate(startDate);
    setEndDate(endDate);
  }

  const applyCustomDate = () => {
    if (!customStartDate || !customEndDate) {
      return dispatch(setAlert({message: 'Please fill in dates', type: 'error'}))
    }

    const startDate = new Date(customStartDate);
    const endDate = new Date(customEndDate); 
    if (startDate > endDate) return dispatch (setAlert({message: 'Start date cannot be higher than end date!', type: 'error'}))

    setStartDate(startDate?.toISOString());
    setEndDate(endDate?.toISOString());
    setSelectedDateOption('custom');
  }

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
    setSelectedDateOption('');
    setCustomStartDate('');
    setCustomEndDate('');
  }


  const toggleYearsDropdown = (e: any) => {
    if(customDateDropdown) setCustomDateDropdown(false)
    setYearsDropdown(!yearsDropdown);
  }

  const toggleCustomDateDropdown = (e: any) => {  
    if(yearsDropdown) setYearsDropdown (false);
    setCustomDateDropdown(!customDateDropdown)
  }

  const handleClose = () => {    
    if (customDateDropdown) setCustomDateDropdown(false);
    if (yearsDropdown) setYearsDropdown(false);
  }

  return (
    <div className='admin-dashboard' onClick={handleClose}>
        <AdminSidebar/>
        <div className='container'>

          <h5>DASHBOARD</h5>

          <div className='upper-row'>
            <div className='card'>
              <i className="fa-solid fa-indian-rupee-sign fa-2x"></i>
              <div>
                <h4>TOTAL REVENUE</h4>
                <h2>{(result as ResultType)?.totalRevenue || 0}</h2>
              </div>
            </div>
            <div className='card'>
              <i className="fa-solid fa-user fa-2x"></i>
              <div>
                <h4>TOTAL USERS</h4>
                <h2>{(result as ResultType)?.totalUsers || 0}</h2>
              </div>
            </div>
            <div className='card'>
              <i className="fa-regular fa-gem fa-2x"></i>
              <div>
                <h4>CURRENT PREMIUM USERS</h4>
                <h2>{(result as ResultType)?.currentPremiumUsers || 0}</h2>
              </div>
            </div>
          </div>

          <div className='options'>
              <button onClick={() => filterByDate('past12months')}> 
                {selectedDateOption === 'past12months' && <i className='fa-solid fa-check'></i>} Past 12 months
              </button>

              <button onClick={() => filterByDate('past30days')}>
                {selectedDateOption === 'past30days' && <i className='fa-solid fa-check'></i>} Past 30 days
              </button>

              <div className='custom-date'>
                <button onClick={toggleCustomDateDropdown}>
                {selectedDateOption === 'custom' && <i className='fa-solid fa-check'></i>} Custom date <i className="fa-solid fa-chevron-down fa-sm"></i>
                </button>
                {
                  customDateDropdown && (
                    <div onClick={(e) => e.stopPropagation()} className="dropdown-menu" style={{top :'3rem' , right: 0}}>
                      <small>start date</small>
                      <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} />
                      <small>end date</small>
                      <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} />
                      <button style={{margin: 0, padding: '5px', marginTop: '5px'}} className={customStartDate && customEndDate ? 'btn-primary' : 'btn-disabled'} onClick={applyCustomDate} >Apply</button>
                    </div>
                  )
                }
              </div>
              
              <div className="filter-by-year" >
                <button onClick={toggleYearsDropdown}>{selectedDateOption?.startsWith('year') && <i className='fa-solid fa-check'></i>} Year <i className="fa-solid fa-chevron-down fa-sm"></i> </button>
                {
                  yearsDropdown && (
                    <div className="dropdown-menu" style={{top :'3rem' , right: 0}}>
                      {years.map((year) => (
                        <div onClick={() => filterByDate(`year-${year}`)} key={year} className="dropdown-option">
                          {year} &nbsp; {selectedDateOption.includes(`${year}`) && <i className='fa-solid fa-check'></i>}
                        </div>
                      ))}
                    </div>
                  )
                }
              </div>

              {selectedDateOption && <button onClick={clearFilter} id='clearButton' ><i className="fa-solid fa-xmark fa-xlg"></i> clear</button>}
          </div>


          <div className='analytics'>
            <div className="graph">             
              <BarChart data={revenueChartData}/>
            </div>
            <div className="graph">
              <BarChart data={signInChartData}/>
            </div>
            <div className="graph pie-chart">              
              <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                <PieChart data={userRoleChartData}/>
              </div>
            </div>
            <div className="graph pie-chart">
              <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                <PieChart data={premiumChartData}/>
              </div>
            </div>
          </div>    
        </div>        
    </div>
  )
}

export default AdminDashBorad