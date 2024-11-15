import React, { useState } from 'react';
import './EditSubscription.css';
import axios from '../../axiosConfig';
import { useDispatch } from 'react-redux';
import { setAlert } from '../../redux/alertSlice';

interface EditSubscriptionProps {
    planToEdit: {
        _id: string,
        title: string,
        durationType: string,
        durationValue: number,
        price: number
    },
    setPlans: React.Dispatch<React.SetStateAction<{}[]>>
    setEditModal: React.Dispatch<React.SetStateAction<boolean>>
}

const EditSubscription:React.FC<EditSubscriptionProps> = ({planToEdit, setPlans, setEditModal}) => {

    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState(planToEdit.title);
    const [durationType, setDurationType] = useState(planToEdit.durationType);
    const [durationValue, setDurationValue] = useState(planToEdit.durationValue);
    const [price, setPrice] = useState(planToEdit.price);

    const [titleError, setTitleError] = useState('');
    const [durationTypeError, setDurationTypeError] = useState('');
    const [durationValueError, setDurationValueError] = useState('');
    const [priceError, setPriceError] = useState('');
    const dispatch = useDispatch();

    const handleEditPlan = async () => {
        try {
           
            if (!title || !durationType || !durationValue || (!price && price !== 0)) {
                !title ? setTitleError('Title is required') : setTitleError('');
                !durationType ? setDurationTypeError('Duration type is required') : setDurationTypeError('');
                !durationValue ? setDurationValueError('Duration value is required') : setDurationValueError('');
                !price && price !== 0 ? setPriceError('Price is required') : setPriceError('');
                return
            }

            const { data } = await axios.put(`/admin/subscription-plans/${planToEdit._id}`, {
                title: title.trim(),
                durationType,
                durationValue,
                price
            })
              
            if (data.success) {
                setPlans((prevPlans) => (
                    [...prevPlans].map((plan:any) => {
                        if (plan._id === planToEdit._id) {
                            return {
                                ...plan,
                                title,
                                durationType,
                                durationValue,
                                price
                            }
                        } else {
                            return plan
                        }
                    })
                ))

                setEditModal(false);
                dispatch(setAlert({message: 'plan updated successfully', type: 'success'}))
            }
        } catch (error) {
            console.log(error);            
        }
    }
  return (
    <div className="dialog-overlay">
        <i onClick={()=>{
            setEditModal(false);            
        }} style={{position: 'absolute', top: '2rem', right: '2rem', fontSize: 'x-large'}} className='bi bi-x-lg'></i>
        <div className='editPlanCard'>

            <div className='heading'>
                <h4>EDIT PLAN</h4>
            </div>

            <div className='input-group'>
                <label htmlFor="title">Plan Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder='Name of plan' id='title' type="text" />
                {titleError && <span className='error'>{titleError}</span>}
            </div>
            <div className='input-group'>
                <label htmlFor="">Duration Type</label>
                <select value={durationType} onChange={(e)=>setDurationType(e.target.value)}>
                    <option value="">Select day/month/year</option>
                    <option value="day">Day</option>
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                </select>
                {durationTypeError && <span className='error'>{durationTypeError}</span>}
            </div>
            <div className='input-group'>
                <label htmlFor="durationValue">Duration Value</label>
                <input min={1} max={30} value={durationValue} onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if(value < 1 || value > 30) return setDurationValueError('Duration value can be between 1 - 30')
                    setDurationValue(parseInt(e.target.value))
                }} placeholder='Number of days/month/year' id='durationValue' type="number" />
                {durationValueError && <span className='error'>{durationValueError}</span>}
            </div>
            <div className='input-group'>
                <label htmlFor="price">Price</label>
                <input min={0} max={5000} value={price} onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if(value < 0 || value > 5000) return
                    setPrice(parseInt(e.target.value))
                }} placeholder='Price of plan' id='price' type="number" />
                {priceError && <span className='error'>{priceError}</span>}
            </div>

            <button 
            style={{width: '100%', marginTop: '10px'}}
            className='btn-primary'
            onClick={handleEditPlan}
            >
                Edit
            </button>
        </div>
    </div>
  )
}

export default EditSubscription