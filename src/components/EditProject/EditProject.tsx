import './EditProject.css'
import React, { useState } from 'react'
import { projectThemes } from '../../constants/constants';
import axios from '../../axiosConfig';
import { useParams } from 'react-router-dom';

const EditProject:React.FC<any> = ({project, setProject, setEditProjectModal}) => {

    const {workspaceId, projectId} = useParams();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState(project.title);
    const [description, setDescription] = useState(project.description);
    const [theme, setTheme] = useState(project.theme);


    const editProject = async () => {
        try {
            setLoading(true);
            const {data} = await axios.patch (`/workspaces/${workspaceId}/projects/${projectId}`,{
                title,
                theme,
                description
            });
            if (data.success) {
                setEditProjectModal(false);
                setProject((prevProject:any)=> ({
                    ...prevProject,
                    title,
                    description,
                    theme
                }))
            }
        } catch (error) {
            console.log(error);       
        } finally {
            setLoading(false);
        }
    }

    const handleClose = (event:React.MouseEvent<HTMLDivElement, MouseEvent>) => {      
        setEditProjectModal(false);
    };

  return (
    <>
    <div className='dialog-overlay'>
        <i onClick={handleClose} className='bi bi-x-lg close-button'></i>
    <div className='editProject'>
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
        onClick={editProject}
        style={{marginTop: '5%'}}
        >Edit Project
        </button>
    </div> 
    </div>
    </>
  )
}

export default EditProject