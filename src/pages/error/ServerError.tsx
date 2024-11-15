import React from 'react'

function ServerError() {
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
    <img src="/images/server-error.png"  width={50} height={50}/> <br />
    <h1>500</h1>
    <h2>Internal Server Error</h2>
  </div>
  </>
  )
}

export default ServerError