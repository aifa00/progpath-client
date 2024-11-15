import './AddLabel.css'
import { labelThemes } from '../../constants/constants'
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setAlert } from '../../redux/alertSlice';

interface AddLabelProps {
    setLabels: React.Dispatch<React.SetStateAction<{}[]>>
    setEdit: React.Dispatch<React.SetStateAction<boolean>>
}

const AddLabel:React.FC<AddLabelProps> = ({setLabels, setEdit}) => {
    const [text, setText] = useState('');
    const [theme, setTheme] = useState('');
    const dispatch = useDispatch();

  return (
    <div className='labelDropdown'>
        <div className='input-group'>
            <small>Text</small>
            <input type="text" placeholder='Type label'
            value={text}
            onChange={(e)=> setText(e.target.value)}
            />
        </div>

        <div className='input-group'>                
            <small>Theme</small>
            <div className="theme-options">
                {labelThemes.map(color => (
                    <div
                        key={color}
                        className={`theme-option`}
                        style={{ backgroundColor: color }}            
                        onClick={() => setTheme(color)}
                    >
                    {color === theme && <i  style={{color: 'var(--color-tertiary)'}} className="bi bi-check-lg"></i>}
                    </div>
                ))}
            </div>
        </div>  

        <button 
        className={!text || !theme ? 'btn-disabled' : 'btn-primary'}
        onClick={()=> {
            if (!text || !theme) return
            if (text.length > 25) return dispatch(setAlert({message: "Lables can't be more than twenty five characters", type: 'error'}))
            setLabels((prev:any)=>([...prev, {_id: Date.now(), text, theme}]));            
            setEdit(true);            
        }}
        style={{marginTop: '5%'}}
        >Add
        </button>

    </div>
  )
}

export default AddLabel