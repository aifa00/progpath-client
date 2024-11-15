import { useEffect, useState } from 'react';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import './AdminSubscriptions.css';
import axios from '../../axiosConfig';
import { setAlert } from '../../redux/alertSlice';
import { useDispatch } from 'react-redux';
import EditSubscription from '../EditSubscription/EditSubscription';
import AddSubscriptionPlan from '../AddSubscription/AddSubscriptionPlan';


function AdminSubscriptions() {
    const [addPlanModal, setAddPlanModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [plans, setPlans] = useState<{}[]>([]);
    const [planToEdit, setPlanToEdit] = useState<any>({});
    const dispatch = useDispatch();

    useEffect (()=> {
        const fetchPlans = async () => {
            try {
              const { data } = await axios.get('/admin/subscription-plans') 
              
              if (data.success) { 
                setPlans(data.plans);          
              }
      
            } catch (error) {
              console.log(error);        
            }
        }
        fetchPlans();
    }, [])


    const handleActionDisable = async (id:string, action:string) => {
        try {        
            setPlans((prevPlans) => (
                [...prevPlans].map((plan:any) => {
                    if (plan._id === id) {
                        return {...plan, active: action === 'activate'}
                    } else {
                        return plan
                    }
                })
            ))
    
          const { data } = await axios.patch(`/admin/subscription-plans/${id}/disable`, {
            action
          });
    
          if (data.success) {
            dispatch(setAlert({message: `Plan ${action === 'disable' ? 'Disabled' : 'Activated'} successfully`, type: 'success'}))
          }
    
        } catch (error) {
          setPlans(plans);
          console.log(error);
        }
    }
    const getDurationUnit = (value:number, type:string)=> {
        if (type === 'day') {
            return value > 1 ? 'Days' : 'Day'
        } else if (type === 'month') {
            return value > 1 ? 'Months' : 'Month'
        } else if (type === 'year') {
            return value > 1 ? 'Years' : 'Year'
        }
    }
    
  return (
    <div className='admin-subscriptonPlans'>
        <AdminSidebar/>
        <div className='container'>
          <h5>SUBSCRIPTION PLANS (Allowed 5)</h5>
          <button onClick={() => setAddPlanModal(true)} id='addButton'><strong>+ Add Plan</strong></button>
          
          <div className='table'>
          <table>
              <thead>
                  <tr>
                    <th>No</th>
                    <th>Plan Title</th>
                    <th>Price</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
              </thead>
              <tbody>


                {
                  plans.length > 0 ? (
                      plans.map ((plan:any, i) => (
                          <tr key={plan._id}>
                            <td>{i + 1}</td>
                            <td><strong>{plan.title}</strong></td>            
                            <td>{plan.price > 0 && '₹ '}{plan.price}</td>
                            <td>{plan.durationValue} {getDurationUnit(plan.durationValue, plan.durationType)}</td>
                            <td style={{color: plan.active ? 'var(--color-success)' : 'var(--color-error)'}}>
                            <strong>{plan.active ? 'Active' : 'Disabled'}</strong> &nbsp;
                            <i className="bi bi-circle-fill"></i>                                
                            </td>
                            <td>
                              <button onClick={()=>{
                                  setPlanToEdit(plan);
                                  setEditModal(true)
                              }}>Edit</button>
                              <button className='bock-button' onClick={() => handleActionDisable(plan._id, plan.active ? 'disable' : 'activate')}>{plan.active ? 'Disable' : 'Activate'}</button>
                            </td>
                          </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={6}>NO DATA FOUND</td>
                    </tr>
                  )
                }            
              </tbody>
          </table>
          </div>

        </div>
        {editModal && 
        <EditSubscription
        planToEdit = {planToEdit}
        setPlans = {setPlans}
        setEditModal = {setEditModal}
        />}
        {addPlanModal && 
        <AddSubscriptionPlan  
        setPlans = {setPlans}
        setAddPlanModal = {setAddPlanModal}
        />}
    </div>
  )
}

export default AdminSubscriptions