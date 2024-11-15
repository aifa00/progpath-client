import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useDispatch } from 'react-redux';
import { notify } from '../../redux/notifySlice';
import axios from '../../axiosConfig';
import { BarLoader, MoonLoader } from 'react-spinners';
import { descriptionModules, featureModules, 
    highlightModules, basicModules } from '../../constants/constants';
import { setAlert } from '../../redux/alertSlice';
import Dialog from '../../assets/Dialog';



interface AddProgramProps {
    programId: string
    setViewProgram: React.Dispatch<React.SetStateAction<boolean>>,
    setPrograms: any
}

const ViewProgram:React.FC<AddProgramProps> = ({programId, setViewProgram, setPrograms}) => {

    const [loading, setLoading] = useState<boolean> (false);
    const [edit, setEdit] = useState<boolean> (false);
    const [program, setProgram] = useState<any> ([]);
    const [rejectedMessage, setRejectedMessage] = useState<string> ('');
    const [imageOne, setImageOne] = useState<{key: string, imageUrl: string} | null> (null);
    const [imageTwo, setImageTwo] = useState<{key: string, imageUrl: string} | null> (null);
    const [imageThree, setImageThree] = useState<{key: string, imageUrl: string} | null> (null);
    const [title, setTitle] = useState<string> ('');
    const [languages, setLanguages] = useState<string> ('');
    const [frameworks, setFrameworks] = useState<string> ('');
    const [technologies, setTechnologies] = useState<string> ('');
    const [description, setDescription] = useState<string> ('');
    const [features, setFeatures] = useState<string> ('');
    const [highlights, setHighlights] = useState<string> ('');
    const [collaborators, setCollaborators] = useState<string> ('');
    const [contact, setContact] = useState<string> (''); 
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState({
        header: '',
        message: '',
        toDelete: false,
        onCancel: () => {},
        onSuccess: () => {}
    });
    
    const [titleError, setTitleError] = useState<string> (''); 
    const [descriptionError, setDescriptionError] = useState<string> ('');
    const [featuresError, setFeaturesError] = useState<string> ('');
    const [languagesError, setLanguagesError] = useState<string> ('');
    const [imageLoading, setImageLoading] = useState< number | null>(null);
    const dispatch = useDispatch();

    useEffect (() => {
        const fetchProgram = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`/admin/programs/${programId}`)
                
                if (data.success) {
                    const program = data.program;
                    setProgram(program);
                    setProgramToStates(program)
                }
            } catch (error) {
                console.log(error);                
            } finally {
                setLoading(false);
            }
        }
        fetchProgram();
    }, [programId])

    const setProgramToStates = (program: any) => {
        setTitle(program.title)
        setDescription(program.description)
        setFeatures(program.features)
        setLanguages(program.languages)
        setFrameworks(program.framework)
        setTechnologies(program.technologies)
        setHighlights(program.highlights);
        setCollaborators(program.collaborators);
        setContact(program.contact);
        setImageOne(program?.images[0])
        setImageTwo(program?.images[1])
        setImageThree(program?.images[2])
        setImageThree(program?.rejectedMessage)
    }

    const handleSaveProgram = async () => {
        try {
            let hasError = false;

            if (!title) {
                setTitleError('This field is required');
                hasError = true;
            } else {
                setTitleError('');
            }
            if (!description || description === '<p><br></p>') {
                setDescriptionError('This field is required');
                hasError = true;
            } else {
                setDescriptionError('');
            }
            if (!features || features === '<p><br></p>') {
                setFeaturesError('This field is required');
                hasError = true;
            } else {
                setFeaturesError('');
            }
            if (!languages) {
                setLanguagesError('This field is required');
                hasError = true;
            } else {
                setLanguagesError('');
            }    

            if (hasError) return;

            setLoading(true);
            const { data } = await axios.put(`/admin/programs/${programId}`, {
                title: title.trim(),
                description,
                features,
                languages: languages?.trim(),
                frameworks: frameworks?.trim(),
                technologies: technologies?.trim(),
                highlights,
                collaborators,
                contact
            })
            
            if (data.success) {                
                setEdit(false);
                dispatch(setAlert({message: "Saved successfully", type: 'success'}));
                if (setPrograms) {
                    setPrograms((prevPrograms: any) => (
                        [...prevPrograms].map((p: any) => {
                            if (p._id === programId) {
                                return {
                                    ...p,
                                    title,                                           
                                }
                            } else {
                                return p
                            }
                        })
                    ))
                }
            }
            
        } catch (error) {
            console.log(error);            
        } finally {
            setLoading(false);
        }
    }


    const handleDeleteImage = async (e: React.MouseEvent<HTMLElement>, imageNum: number, imageKey: string) => {
        
        e.preventDefault();

        setDeleteDialog({
            header: 'Delete Image ?',
            message: '',
            toDelete: true,
            onCancel: () => { 
                setOpenDeleteDialog(false);
            },
            onSuccess: async () => {
                try {
                    setOpenDeleteDialog(false);

                    if (
                        (imageNum === 1 && !imageTwo && !imageThree) ||
                        (imageNum === 2 && !imageOne && !imageThree) ||
                        (imageNum === 3 && !imageOne && !imageTwo)
                    ) {
                        return dispatch(notify({ message: `All images cannot be deleted! Atleast one image is required`, type: 'error' }));
                    }

                    if (imageNum === 1) {
                        setImageLoading(1)
                    } else if (imageNum === 2) {
                        setImageLoading(2)
                    } else if (imageNum === 3) {
                        setImageLoading(3)
                    }
        
                    const encodedImageKey = encodeURIComponent(imageKey);

                    const { data } = await axios.delete(`/admin/programs/${programId}/images/${encodedImageKey}`);
                    
                    if (data.success) {
                        dispatch(setAlert({message: "Image Deleted", type: 'success'}));
        
                        if (imageNum === 1) {
                            setImageOne(null);
                        } else if (imageNum === 2) {
                            setImageTwo(null);
                        } else if (imageNum === 3) {
                            setImageThree(null);
                        }                                            
                    }
                } catch (error) {                        
                    console.log(error);
                } finally {
                    setImageLoading(null)
                }
            }
        });

        setOpenDeleteDialog(true);
    }      

    const handleCloseForm = () => {
        document.body.classList.remove('modal-open');
        setViewProgram(false);
    }

    const handleCancelEdit = () => {
        setEdit(false);
        setProgramToStates(program);
    }


  return (    
    <div className="form-overlay">
        <i onClick={handleCloseForm} className='bi bi-x-lg close-button'></i>
        <div className='addprogram-form' style={{border: (titleError || descriptionError || featuresError || languagesError) && '1px solid var(--color-error)'}}>           

            <div style={{position: 'absolute', top: '1%', right: '4%'}}>
                {
                    !edit ? (
                        <button style={{paddingInline: '20px'}} className='btn-secondary' onClick={() => setEdit(true)}>edit</button>
                    ) : (
                        <>
                        <button className='btn-tertiary' onClick={handleCancelEdit}>Cancel</button>
                        <button style={{marginLeft: '10px'}} className='btn-secondary' onClick={handleSaveProgram}>Save</button>
                        </>
                    )
                }                
            </div>
            
            <br /> <h5>IMAGES*</h5> <br />
            <div className='image-group'>
                <label>
                  <img src={imageOne ? imageOne?.imageUrl : "/images/no-image-placeholder.jpg"}  alt='placeholder'/>             
                  {edit && imageOne && <i onClick={(e)=>handleDeleteImage(e, 1, imageOne?.key)} className='fa-solid fa-trash fa-lg'></i>}
                  {imageLoading === 1 && <div className='spinner'><MoonLoader /></div>}
                </label>
                <label>
                <img src={imageTwo ? imageTwo.imageUrl : "/images/no-image-placeholder.jpg"} alt='placeholder'/>     
                  {edit && imageTwo && <i onClick={(e)=>handleDeleteImage(e, 2, imageTwo?.key)} className='fa-solid fa-trash fa-lg'></i>}
                  {imageLoading === 2 && <div className='spinner'><MoonLoader /></div>}
                </label>
                <label>
                <img src={imageThree ? imageThree.imageUrl : "/images/no-image-placeholder.jpg"} alt='placeholder'/>                  
                  {edit && imageThree && <i onClick={(e)=>handleDeleteImage(e, 3, imageThree?.key)} className='fa-solid fa-trash fa-lg'></i>}
                  {imageLoading === 3 && <div className='spinner'><MoonLoader /></div>}
                </label>
            </div>

            <div className='input-group'>
                <label htmlFor="title">TITLE*</label> 
                {
                    edit ? (
                        <>
                        <input 
                        value={title} 
                        onChange={(e)=>setTitle(e.target.value)}
                        id='title' 
                        type="text" 
                        placeholder="Enter the title of your project"
                        />
                        {titleError && <span className="error">{titleError}</span>}
                        </>
                    ) : (
                        title ? <h4>{title}</h4> : <small style={{color: 'var(--color-text-secondary)'}}>Not given</small>
                    )
                }
            </div>

            <div className='input-group'>
                <label htmlFor="description">DESCRIPTION*</label>
                {
                    edit ? (
                        <>
                        <ReactQuill 
                        theme="snow" 
                        value={description} 
                        id='description' 
                        modules={descriptionModules}
                        onChange={setDescription} 
                        placeholder= "Provide a brief overview of what your project does and its main purpose"
                        className="custom-quill-editor" 
                        />
                        {descriptionError && <span className="error">{descriptionError}</span>}
                        </>
                    ) : (
                        description ? <div dangerouslySetInnerHTML={{ __html: description }} /> : <small style={{color: 'var(--color-text-secondary)'}}>Not given</small>
                    )
                }                
            </div>

            <div className='input-group'>
                <label htmlFor="features">FEATURES*</label>
                {
                    edit ? (
                        <>
                        <ReactQuill 
                        theme="snow" 
                        value={features}
                        id='features' 
                        modules={featureModules}
                        onChange={setFeatures} 
                        className="custom-quill-editor"
                        placeholder='eg: Easy CSV Upload: Drag-and-drop interface for uploading CSV files.
                        Multiple Graph Types: Line, bar, pie, and scatter plots.'
                        />
                        {featuresError && <span className="error">{featuresError}</span>}
                        </>
                    ) : (
                        features ? <div dangerouslySetInnerHTML={{ __html: features }} /> : <small style={{color: 'var(--color-text-secondary)'}}>Not given</small>
                    )
                }                            
            </div>

            <div className='input-group'>
                <label htmlFor="title">LANGUAGES*</label>        
                {
                    edit ? (
                        <>
                        <input 
                        value={languages} 
                        onChange={(e)=> setLanguages (e.target.value)}
                        id='languages' 
                        type="text" 
                        placeholder="Enter the languages used in project/program (e.g., Python, JavaScript, C++, Java, PHP)"
                        />
                        {languagesError && <span className="error">{languagesError}</span>}
                        </>
                    ) : (
                        languages ? <p>{languages}</p> : <small style={{color: 'var(--color-text-secondary)'}}>Not given</small>
                    )
                }
            </div>

            <div className='input-group'>
                <label htmlFor="title">FRAMEWORKS</label>                
                {
                    edit ? (
                        <input 
                        value={frameworks} 
                        onChange={(e)=> setFrameworks(e.target.value)}
                        id='frameworks'
                        type="text" 
                        placeholder= "Enter the languages used in your project/program (e.g., React, Angular, Express, Django)"
                        />
                    ) : (
                        frameworks ? <p>{frameworks}</p> : <small style={{color: 'var(--color-text-secondary)'}}>Not given</small>
                    )
                }
            </div>

            <div className='input-group'>
                <label htmlFor="title">TECHNOLOGIES</label>
                {
                    edit ? (
                        <input 
                        value={technologies} 
                        onChange={(e)=> setTechnologies(e.target.value)}
                        id='frameworks'
                        type="text" 
                        placeholder= "Enter the technologies used in your project/program (e.g., Docker, AWS, Azure, Webpack)"
                        />
                    ) : (
                        technologies ? <p>{technologies}</p> : <small style={{color: 'var(--color-text-secondary)'}}>Not given</small>
                    )
                }                            
            </div>



            <div className='input-group'>
                <label htmlFor="highlights">HIGHLIGHTS</label>
                {
                    edit ? (
                        <ReactQuill 
                        theme="snow" 
                        value={highlights} 
                        id='highlights' 
                        modules={highlightModules}
                        onChange={setHighlights} 
                        className="custom-quill-editor"
                        placeholder='eg: User-Friendly Interface: Intuitive design for effortless graph creation.'
                        />
                    ) : (
                        highlights ? <div dangerouslySetInnerHTML={{ __html: highlights }} /> : <small style={{color: 'var(--color-text-secondary)'}}>Not given</small>
                    )
                }                
            </div>

            <div className='input-group'>
                <label htmlFor="highlights">COLLABORATORS</label>
                {
                    edit ? (
                        <ReactQuill 
                        theme="snow" 
                        value={collaborators} 
                        id='highlights'
                        modules={basicModules}
                        onChange={setCollaborators} 
                        className="custom-quill-editor"
                        placeholder="Provide details about collaborators or team members who contributed to the project (e.g., names, roles, contributions)"
                        />
                    ) : (
                        collaborators ? <div dangerouslySetInnerHTML={{ __html: collaborators }} /> : <small style={{color: 'var(--color-text-secondary)'}}>Not given</small>
                    )
                }
            </div>

            <div className='input-group'>
                <label htmlFor="highlights">CONTACT INFORMATIONS</label>
                {
                    edit ? (
                        <ReactQuill 
                        theme="snow" 
                        value={contact} 
                        id='highlights' 
                        modules={basicModules}
                        onChange={setContact} 
                        className="custom-quill-editor"
                        placeholder= "Enter contact details such as email, phone number, LinkedIn, GitHub, or other relevant links. You can also include the company address or any other contact information"
                        />
                    ) : (
                        contact ? <div dangerouslySetInnerHTML={{ __html: contact }} /> : <small style={{color: 'var(--color-text-secondary)'}}>Not given</small>
                    )
                }                
            </div>  

            {
                rejectedMessage && (
                    <div style={{backgroundColor: 'rgba(255, 54, 50, 0.1)', padding: '1rem', border: '2px solid red', borderRadius: '10px'}}>
                        <p>Rejected: {rejectedMessage}</p>
                    </div>
                )
            }
            
            {loading && <BarLoader width={'100%'} color='var(--color-blue)' />}
        </div>
    {
        openDeleteDialog && (
        <Dialog
        header={deleteDialog.header}
        message={deleteDialog.message}
        toDelete={deleteDialog.toDelete}
        onCancel={deleteDialog.onCancel}
        onSuccess={deleteDialog.onSuccess}
        />
        )
    }
    </div>
  )
}

export default ViewProgram
