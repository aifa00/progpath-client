import React from 'react'

function NetworkError() {
  return (
    <>
  <div 
  style={{
    color: 'var(--color-text-primary)', 
    position:'fixed', 
    top: '50%', 
    left: '50%', 
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    <img src="/images/network-error.png"  width={50} height={50}/> <br />
    <h5>Something went wrong please try again!</h5>
  </div>
  </>
  )
}

export default NetworkError