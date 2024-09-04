import { useEffect, useState } from 'react'
import HeroSection from '../../components/HeroSection/HeroSection'
import Section from '../../components/Section/Section';
import Footer from '../../components/Footer/Footer';
import Login from '../../components/Login/Login';
import Signup from '../../components/Signup/Signup';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { notify } from '../../redux/notifySlice';
import { useLocation } from 'react-router-dom';


interface DataItem {
  title: string;
  text: string;
  isLeft: boolean
}

function LandingPage() {

  const form = useSelector((state: RootState) => state.form.value)
  
  const [data] = useState <DataItem[]> ([
    {
      title: 'Optimize Your Workflow with Comprehensive Tracking',
      text: `ProgPath empowers you to optimize your workflow with our  tracking features. 
      Easily create and assign tasks, set deadlines, and monitor progress. Get Dashboard with timely reminders to ensure you never miss a deadline. 
      ProgPath helps you stay on top of every detail, ensuring your projects are completed efficiently and on schedule.`,
      isLeft: true
    },
    {
      title: 'Streamline Your Projects and Marketplace',
      text: `With ProgPath, Discover our integrated marketplace to explore and market projects, enhancing your development process and productivity. 
      ProgPath combines project management and a robust marketplace, making it your one-stop solution for all your development career.`,
      isLeft: false
    }
  ])

  const dispatch = useDispatch();
  const location = useLocation();

  useEffect (() => {
    const queryParams = new URLSearchParams(location.search)
    const invitation = queryParams.get('invitation');
    if (invitation) {
      dispatch(notify({message: 'PLease login to accept invitations and collaborate on workspaces', type: 'warning'}))
    }
  }, [])

  return (
    <>    
    <HeroSection/>
    {
      data.map ((obj) => {
        return <Section key={obj.title} title={obj.title} text={obj.text} isLeft= {obj.isLeft} />
      })
    }
    <Footer/>
    {form === 'login' && <Login/>}
    {form === 'signup' && <Signup/>} 
    </>
  )
}

export default LandingPage;