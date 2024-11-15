import './AddProject.css'
import React, { useEffect, useState } from 'react';
import { projectThemes } from '../../constants/constants';
import axios from '../../axiosConfig';
import { useParams } from 'react-router-dom';


interface AddProjectProps {
    setDropDown: React.Dispatch<React.SetStateAction<string>>
    setProjects: React.Dispatch<React.SetStateAction<{}[]>>
}
const AddProject:React.FC<AddProjectProps> = ({setDropDown, setProjects}) => {

    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [theme, setTheme] = useState('');
    const [description, setDescription] = useState('');
    const {workspaceId} = useParams();


    const addProject = async () => {
        try {
            setLoading(true);
            const {data} = await axios.post (`/workspaces/${workspaceId}/projects`,{
                title,
                theme,
                description
            });
            if (data.success) {
                setDropDown('');
                setProjects((prevProjects) => (
                    [
                        {_id: data.projectId,
                            title,
                            theme,                        
                        }, 
                        ...prevProjects
                    ]
                ))
            }
        } catch (error) {
            console.log(error);       
        } finally {
            setLoading(false);
        }
    }
    



  return (
    
    <div className='addProject'>
        <div className='input-group'>                
            <label htmlFor="title">Title</label>
            <input type="text" id="title" placeholder='eg:Design and UX'
            value={title}
            onChange={(e)=> setTitle(e.target.value)}
            />
        </div>

        <div className='input-group'>                
            <label htmlFor="title">Theme</label>
            <div className="theme-options">
                {projectThemes.map(color => (
                    <div
                        key={color}
                        className={`theme-option`}
                        style={{ backgroundColor: color }}            
                        onClick={() => setTheme(color)}
                    >
                    {color === theme && <i className="bi bi-check-lg"></i>}
                    </div>
                ))}
            </div>
        </div>                    
        
        <div className='input-group'>
            <label htmlFor="description">Description</label> <br />
            <textarea id="description" rows={3}
            placeholder='Describe your project'
            value={description} 
            onChange={(e)=> setDescription(e.target.value)}
            />                      
        </div>

        <button 
        className={!title || !theme || loading ? 'btn-disabled' : 'btn-primary'}
        onClick={addProject}
        style={{marginTop: '5%'}}
        >Create Project
        </button>
        
    </div> 
  )
}

export default AddProject