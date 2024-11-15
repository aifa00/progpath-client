import React from 'react';
import './Pagination.css';


interface paginationProps {
    from: number | null | undefined,
    to: number | null | undefined,
    totalResults: number,
    page: number | null,
    totalPages: number,
    setPage: React.Dispatch<React.SetStateAction<number>>
}


const Pagination:React.FC<paginationProps> = ({from, to, totalResults, page, totalPages, setPage}) => {

    const handleNext = () => {
        setPage ((curentPage: any) => {

            const nextPage = curentPage + 1

            if (nextPage <= totalPages) {
                return nextPage
            } else {
                return curentPage
            }
        })
    }

    const handlePrev = () => {
        setPage ((curentPage: any) => {

            const prevPage = curentPage  - 1;

            if (prevPage > 0 ) {
                return prevPage
            } else {
                return curentPage
            }                
        })
    }


  return (
    <div className='pagination'>
        <div>
        <span><strong>{from}</strong> - <strong>{to}</strong> of <strong>{totalResults}</strong> results </span>
        </div>

        <div>                
        <button 
        style={{fontSize: 'smaller'}}
        onClick={handlePrev}
        >
            <i className="bi bi-chevron-left"></i>
        </button>

        page <strong>{page}</strong>&nbsp;of&nbsp;<strong>{totalPages}</strong>
                                    
        <button 
        style={{fontSize: 'smaller'}}
        onClick={handleNext}
        >
            <i className="bi bi-chevron-right"></i>
        </button>
        </div>
    </div>
  )
}

export default Pagination