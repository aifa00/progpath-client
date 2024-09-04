import { useState } from 'react'
import './ChangePassword.css'
import axios from '../../axiosConfig';
import { useDispatch } from 'react-redux';
import { setAlert } from '../../redux/alertSlice';

const ChangePassword:React.FC<any> = ({setChangePassword}) => {

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const dispatch = useDispatch();

    const handleSubmit = async () => {
        try {
            let errorMessage = ''
            if (!currentPassword && !newPassword && !confirmPassword) errorMessage = 'Please provide the required credentials to continue'
            if (currentPassword && !newPassword && !confirmPassword) errorMessage = 'Please provide the new password to continue'
            if (!currentPassword && newPassword && confirmPassword) errorMessage = 'Please provide the current password to continue'
            if (currentPassword && newPassword && !confirmPassword) errorMessage = 'Please provide confirm password to continue'
            if (currentPassword && newPassword !== confirmPassword) errorMessage = 'New password and current password did not match!'
            if (!currentPassword && newPassword !== confirmPassword) errorMessage = 'Please provide current password to continue!'

            if (errorMessage) return setError(errorMessage);

            const {data} = await axios.patch(`/profile/password`, {
                currentPassword,
                newPassword,
                confirmPassword
            });

            if (data.success) {
                setError('');
                setChangePassword(false);
                dispatch(setAlert({message: 'Password updated successfully ', type: 'success'}));
            }
            
        } catch (error) {
            console.log(error);            
        }
    }
  return (
    <div className='dialog-overlay'>
        <i onClick={()=>setChangePassword(false)} className='bi bi-x-lg close-button'></i>
     
        <div className="changePassword">
            <h5>CHANGE PASSWORD</h5>
            <div className='input-group'>                
                <label htmlFor="title">Current Password*</label>
                <input type="password" id="title" 
                placeholder='current password'
                value={currentPassword}
                onChange={(e)=> setCurrentPassword(e.target.value)}
                />
            </div>
            <div className='input-group'>                
                <label htmlFor="title">New Password*</label>
                <input type="password" id="title" 
                placeholder='new password'
                value={newPassword}
                onChange={(e)=> setNewPassword(e.target.value)}
                />
            </div>
            <div className='input-group'>                
                <label htmlFor="title">Confirm password*</label>
                <input type="password" 
                id="title" 
                placeholder='confirm password'
                value={confirmPassword}
                onChange={(e)=> setConfirmPassword(e.target.value)}
                />
            </div>

            {
                error && (
                    <div className='error'>
                        {error}
                    </div>
                )
            }

            <button onClick={handleSubmit} className='btn-primary'>Submit</button>
            
        </div>
    </div>
  )
}

export default ChangePassword