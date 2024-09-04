

function NotFound() {
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
    <img src="/images/not-found.png"  width={50} height={50}/> <br />
    <h1 >       
      404 Page Not Found
    </h1>
  </div>
  </>
  )
}

export default NotFound