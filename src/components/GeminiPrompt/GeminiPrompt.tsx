import React, { useEffect, useRef, useState } from 'react';
import './GeminiPrompt.css';
import axios from '../../axiosConfig';
import { convertMarkDownToHtml } from '../../utils/appUtils';
import { BarLoader } from 'react-spinners';

interface GeminiPromptType {
  setResult: React.Dispatch<React.SetStateAction<string>>
}

const barLoaderStyles: React.CSSProperties = {
  borderRadius: '10px',
};

const GeminiPrompt:React.FC<GeminiPromptType> = ({setResult}) => {

  const [promptInput, setPromptInput] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const inputRef: any = useRef();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [promptInput]);


  const sendPrompt = async () => {
    try {
      if (!inputRef.current.value) {
        if (inputRef.current) {
          inputRef.current.focus();
        }
        return 
      }

      setLoading(true)

      const { data } = await axios.post('/gemini/prompt', {
        prompt: inputRef.current.value
      })

      if (data.success) {
        const result = data.result;       
        if (result) {
          const convertedResult = convertMarkDownToHtml(result);
          setResult(convertedResult);
          inputRef.current.value = '';
        }
      }
    } catch (error) {
      console.log(error);      
    } finally {
      setLoading(false);
    }
  }

const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {  
  if (e.key === 'Enter' && !loading) {
    e.preventDefault();
    sendPrompt();
  }
};


  return (
    <div className="gemini-prompt">
        {
          promptInput && (
            <div className='textarea-cover'>
              <textarea onKeyDown={handleKeyDown} ref={inputRef} placeholder='Input your prompt for AI generation...'></textarea>
              <i onClick={sendPrompt} id='send-icon' className="fa-solid fa-paper-plane"></i>
              {loading && <BarLoader width={'100%'} height={'3px'} color='var(--color-violet)' cssOverride={barLoaderStyles}/>}
            </div>
          )
        }
        
        <button className='gemini-icon-button' onClick={() => setPromptInput(!promptInput)}>
            <img src="/images/gemini-icon.svg" alt="Gemini Icon" width="24" height="24" />
        </button>
    </div>
  )
}


export default GeminiPrompt;