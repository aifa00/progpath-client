import React, { useEffect } from 'react';
import { useSelector, useDispatch, TypedUseSelectorHook } from 'react-redux';
import { RootState } from '../redux/store';
import { removeAlert } from '../redux/alertSlice';
import { removeNotify } from '../redux/notifySlice';


const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

function Notify() {

  const notify = useTypedSelector((state) => state.notify);
  const dispatch = useDispatch();

  useEffect (()=> {
    setTimeout(() => {
      dispatch(removeAlert());
    }, 5000);
  }, [])

  let getNotificationTheme = (type:string) => {
    if (type === 'success') return 'var(--color-success)'
    if (type === 'error') return 'var(--color-error)'
    if (type === 'warning') return 'var(--color-warning)'
  }

  
  const notifyStyle = {
    position: 'fixed' as const,
    zIndex: 1000,    
    color: 'var(--color-secondary)',
    top: 0,
    left: '50%',
    transform: 'translate(-50%)',
    padding: '10px',
    fontWeight: 'bold',
    backgroundColor: getNotificationTheme(notify.value.type),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 'auto',
    width: '100%',
    minHeight: '5%', 
  };

  return (       
    <>
    <div style={notifyStyle} >
      <div style={{maxWidth: '70%'}}>{notify.value.message}</div>
      <i 
      style={{
        position: 'absolute', 
        top: '50%',
        transform: 'translate(-50%)',
        right: '3rem'
      }} 
      className='fa-regular fa-x fa-lg'
      onClick={() => dispatch(removeNotify())}>
      </i>
    </div>
    </>   
  )
}

export default Notify