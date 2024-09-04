import React, { useEffect, useState, useTransition } from 'react';
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
import GeminiPrompt from '../GeminiPrompt/GeminiPrompt';



interface AddProgramProps {
    programId: string
    setEditForm: React.Dispatch<React.SetStateAction<boolean>>,
    setPrograms: any
}

const EditProgram:React.FC<AddProgramProps> = ({programId, setEditForm, setPrograms}) => {

    const [loading, setLoading] = useState<boolean> (false);
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
                const { data } = await axios.get(`/profile/programs/${programId}`)
                
                if (data.success) {
                    const program = data.program
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
                }
            } catch (error) {
                console.log(error);                
            } finally {
                setLoading(false);
            }
        }
        fetchProgram();
    }, [programId])

    const handleSaveProgram = async () => {
        try {
            let hasError = false;

            if (!title) {
                setTitleError('This field is required');
                hasError = true;
            } else if (title.length > 100) {
                setTitleError("Title can't be more than 100 characters long");
                hasError = true;
            } else {
                setTitleError('');
            }

            if (!description || description === '<p><br></p>') {
                setDescriptionError('This field is required');
                hasError = true;
            } else if (description.length > 2000) {
                setDescriptionError("Description exceeds the maximum length");
                hasError = true;
            } else {
                setDescriptionError('');
            }

            if (!features || features === '<p><br></p>') {
                setFeaturesError('This field is required');
                hasError = true;
            } else if (features.length > 2000) {
                setFeaturesError("Features exceeds the maximum length");
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
            const { data } = await axios.put(`/marketplace/${programId}`, {
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
                handleCloseForm();
                dispatch(setAlert({message: "Saved successfully", type: 'success'}));
                if (setPrograms) {
                    setPrograms((prevPrograms: any) => (
                        [...prevPrograms].map((p: any) => {
                            if (p._id === programId) {
                                return {
                                    ...p,
                                    title,
                                    description,                                    
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

    const handleAddImage = async (e:React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (e.target.files) {
                if (imageOne && imageTwo && imageThree) return
    
                if (e.target.id === 'image-one') {
                    setImageLoading(1)
                } else if (e.target.id === 'image-two') {
                    setImageLoading(2)
                } else if (e.target.id === 'image-three') {
                    setImageLoading(3)
                }
    
                const image = e.target.files[0];
    
                const formData = new FormData;
                           
                formData.append(`images`, image);
    
                setLoading(true);
    
                const { data } = await axios.post(`/profile/programs/${programId}/images`, 
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                )
                
                if (data.success) {                
                    //Update programs array                
                    setPrograms((prevPrograms: any) => (
                        [...prevPrograms].map((p: any) => {
                            if (p._id === programId) {
                                return {
                                    ...p,
                                   title,
                                   description
                                }
                            } else {
                                return p
                            }
                        })
                    ))
    
                    dispatch(setAlert({message: "Image Uploaded", type: 'success'}));
                    const newImage = data.newImage
                    if (e.target.id === 'image-one') {
                        setImageOne(newImage);
                    } else if (e.target.id === 'image-two') {
                        setImageTwo(newImage);
                    } else if (e.target.id === 'image-three') {
                        setImageThree(newImage)
                    }
                }
            }
        } catch (error) {
            console.log(error);            
        } finally {
            setImageLoading(null);
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

                    const { data } = await axios.delete(`/profile/programs/${programId}/images/${encodedImageKey}`);
                    
                    if (data.success) {
                        dispatch(setAlert({message: "Image Deleted", type: 'success'}));
        
                        if (imageNum === 1) {
                            setImageOne(null);
                        } else if (imageNum === 2) {
                            setImageTwo(null);
                        } else if (imageNum === 3) {
                            setImageThree(null);
                        }

                        const newThumbnailImageUrl = () => {
                            if (imageNum === 1) {
                                return imageTwo ? imageTwo.imageUrl : imageThree?.imageUrl
                            } else if (imageNum === 2) {
                                return imageThree ? imageThree.imageUrl : imageOne?.imageUrl
                            } else if (imageNum === 3) {
                                return imageOne ? imageOne.imageUrl : imageTwo?.imageUrl
                            } else {
                                return ''
                            }                            
                        }
                        setPrograms((prevPrograms: any) => (
                            [...prevPrograms].map((p: any) => {
                                if (p._id === programId) {
                                    return {
                                        ...p,
                                       image: newThumbnailImageUrl()
                                    }
                                } else {
                                    return p
                                }
                            })
                        ))
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
        setEditForm(false);
    }

    
  return (
    
    <div className="form-overlay">

        <div className='addprogram-form' style={{border: (titleError || descriptionError || featuresError || languagesError) && '1px solid var(--color-error)'}}>
            <i onClick={handleCloseForm} className='fa-solid fa-x fa-lg' style={{position: 'absolute', top: '1.5rem', right: '1rem'}}></i>
            
            <br /> <h5>UPLOAD IMAGES *</h5> <br />
            <div className='image-group'>
                <label htmlFor="image-one">
                  <img src={imageOne ? imageOne?.imageUrl : "/images/image-placeholder.jpg"} alt='img-1' />
                  <input onChange={handleAddImage} id='image-one' accept='image/*' type="file" />
                  {imageOne && <i onClick={(e)=>handleDeleteImage(e, 1, imageOne?.key)} className='fa-solid fa-trash fa-lg'></i>}
                  {imageLoading === 1 && <div className='spinner'><MoonLoader /></div>}
                </label>
                <label htmlFor="image-two">
                <img src={imageTwo ? imageTwo.imageUrl : "/images/image-placeholder.jpg"} alt='img-2' />
                  <input onChange={handleAddImage} id='image-two' accept='image/*' type="file" />
                  {imageTwo && <i onClick={(e)=>handleDeleteImage(e, 2, imageTwo?.key)} className='fa-solid fa-trash fa-lg'></i>}
                  {imageLoading === 2 && <div className='spinner'><MoonLoader /></div>}
                </label>
                <label htmlFor="image-three">
                <img src={imageThree ? imageThree.imageUrl : "/images/image-placeholder.jpg"} alt='img-3'/>
                  <input onChange={handleAddImage} id='image-three' accept='image/*' type="file" />
                  {imageThree && <i onClick={(e)=>handleDeleteImage(e, 3, imageThree?.key)} className='fa-solid fa-trash fa-lg'></i>}
                  {imageLoading === 3 && <div className='spinner'><MoonLoader /></div>}
                </label>
            </div>

            <div className='input-group'>
                <label htmlFor="title">TITLE*</label> 
                <input 
                value={title} 
                onChange={(e)=>setTitle(e.target.value)}
                id='title' 
                type="text" 
                placeholder="Enter the title of your project"
                />
                {titleError && <span className="error">{titleError}</span>}
            </div>

            <div className='input-group'>
                <label htmlFor="description">DESCRIPTION*</label>
                <ReactQuill 
                theme="snow" 
                value={description} 
                id='description' 
                modules={descriptionModules}
                onChange={setDescription} 
                placeholder= "Provide a brief overview of what your project does and its main purpose"
                className="custom-quill-editor" 
                />
                <GeminiPrompt setResult={setDescription}/>
                {descriptionError && <span className="error">{descriptionError}</span>}
            </div>

            <div className='input-group'>
                <label htmlFor="features">FEATURES*</label>
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
                <GeminiPrompt setResult={setFeatures}/>
                {featuresError && <span className="error">{featuresError}</span>}
            </div>

            <div className='input-group'>
                <label htmlFor="title">LANGUAGES*</label>
                <input 
                value={languages} 
                onChange={(e)=> setLanguages (e.target.value)}
                id='languages' 
                type="text" 
                placeholder="Enter the languages used in project/program (e.g., Python, JavaScript, C++, Java, PHP)"
                />
                {languagesError && <span className="error">{languagesError}</span>}
            </div>

            <div className='input-group'>
                <label htmlFor="title">FRAMEWORKS</label>
                <input 
                value={frameworks} 
                onChange={(e)=> setFrameworks(e.target.value)}
                id='frameworks'
                type="text" 
                placeholder= "Enter the languages used in your project/program (e.g., React, Angular, Express, Django)"
                />
            </div>

            <div className='input-group'>
                <label htmlFor="title">TECHNOLOGIES</label>
                <input 
                value={technologies} 
                onChange={(e)=> setTechnologies(e.target.value)}
                id='frameworks'
                type="text" 
                placeholder= "Enter the technologies used in your project/program (e.g., Docker, AWS, Azure, Webpack)"
                />
            </div>



            <div className='input-group'>
                <label htmlFor="highlights">HIGHLIGHTS</label>
                <ReactQuill 
                theme="snow" 
                value={highlights} 
                id='highlights' 
                modules={highlightModules}
                onChange={setHighlights} 
                className="custom-quill-editor"
                placeholder='eg: User-Friendly Interface: Intuitive design for effortless graph creation.'
                />
                <GeminiPrompt setResult={setHighlights}/>
            </div>

            <div className='input-group'>
                <label htmlFor="highlights">COLLABORATORS</label>
                <ReactQuill 
                theme="snow" 
                value={collaborators} 
                id='highlights'
                modules={basicModules}
                onChange={setCollaborators} 
                className="custom-quill-editor"
                placeholder="Provide details about collaborators or team members who contributed to the project (e.g., names, roles, contributions)"
                />
                <GeminiPrompt setResult={setCollaborators}/>
            </div>

            <div className='input-group'>
                <label htmlFor="highlights">CONTACT INFORMATIONS</label>
                <ReactQuill 
                theme="snow" 
                value={contact}
                id='highlights' 
                modules={basicModules}
                onChange={setContact} 
                className="custom-quill-editor"
                placeholder= "Enter contact details such as email, phone number, LinkedIn, GitHub, or other relevant links. You can also include the company address or any other contact information"
                />
                <GeminiPrompt setResult={setContact}/>
            </div>

            <button onClick={handleSaveProgram} id='submit-button' className='btn-primary'>SAVE</button>
            
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

export default EditProgram
