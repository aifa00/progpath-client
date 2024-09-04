import { useEffect, useMemo, useState } from 'react'
import './Subscription.css'
import axios from '../../axiosConfig'
import { useDispatch } from 'react-redux';
import { togglePremiumComponent } from '../../redux/premiumSlice';
import { setPremiumUser } from '../../redux/userSlice';



function Subscription() {

    const [plans, setPLans] = useState([]);
    const [subscribed, setSubscribed] = useState(false);
    const [isTrialUsed, setIsTrialused] = useState(false);
    const dispatch = useDispatch();


    useEffect (()=> {
        const fetchData = async () => {
            try { 
                const {data} = await axios.get(`/premium`);

                if (data.success) {                   
                    setPLans(data.plans);
                    setSubscribed(data.subscribed);          
                    setIsTrialused(data.isTrialUsed);                     
                }
            } catch (error) {
                console.log(error);                
            }
        }

        fetchData();
    }, []);

    const freePlan: any = useMemo(() => {
        return plans.find((plan: any) => plan.price === 0);
    }, [plans]);

    const pricedPlans: any = useMemo(()=> {
        return plans.filter((plan:any) => plan.price !== 0);
    }, [plans]);

    const subscribeToTrial = async (planId: string) => {
        try { 
            const {data} = await axios.post(`/subscribe/trial`, {
                planId
            });

            if (data.success) {                
                setSubscribed(true);            
            }
        } catch (error) {
            console.log(error);                
        }
    }

    const handleSubscribe = async (e:any, amount:number, planId:string) => {
        try {
            const amountInPaise = amount * 100;

            const {data} = await axios.post(`/subscribe`, {
                amount: amountInPaise
            })
            
            const order = data.order        
                
            var options = {
                "key": process.env.REACT_APP_RAZORPAY_KEY_ID,              
                "amount": order.amount.toString(),
                "currency": "INR",
                "name": "ProgPath",
                "description": "Premium Subscription",
                "image": "/images/logo-icon-gray.png",
                "order_id": order.id,
                "handler": async (response:any) => {
                    try {                        
                        const {data} = await axios.post('/razorpay-payment-verification', {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            amount,
                            planId
                        });

                        if (data.success) {
                            setSubscribed(true);
                            setIsTrialused(true);
                            dispatch(setPremiumUser(true));
                        }
                    } catch (error) {
                        console.log(error);                        
                    }                                   
                },               
                "notes": {
                    "address": "Razorpay Corporate Office"
                },
                "theme": {
                    "color": "#0C0B11"
                }
            };
            var rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response:any) {
                alert(response.error.code);
                alert(response.error.description);
                alert(response.error.source);
                alert(response.error.step);
                alert(response.error.reason);
                alert(response.error.metadata.order_id);
                alert(response.error.metadata.payment_id);
            });
            rzp1.open();
            e.preventDefault();
        } catch (error) {
            console.log(error);
        }
    }

    const getDurationUnit = (value:number, type:string)=> {
        if (type === 'day') {
            return value > 1 ? 'Days' : 'Day'
        } else if (type === 'month') {
            return value > 1 ? 'Months' : 'Month'
        } else if (type === 'year') {
            return value > 1 ? 'Years' : 'Year'
        }
    }


  return (
    <div className="dialog-overlay">
        <div className='subscription'>
            <i 
            style={{position: 'absolute', top: '2rem', right: '1.5rem'}} 
            className="fa-regular fa-x fa-xl"
            onClick={()=> dispatch(togglePremiumComponent()) }>
            </i>        

            {
                subscribed ? (
                    <div className='subscribed-page'>
                        <div className='main-body'>
                            <div>
                                <h2>Welcome to ProgPath Premium!</h2>
                            </div>
                            <div>
                                <img src="https://static.vecteezy.com/system/resources/thumbnails/012/872/158/small/party-icon-confetti-popper-illustration-png.png" alt='' />
                            </div>
                            <div>
                                <h4>Thank you for upgrading to ProgPath Premium</h4> <br />
                                <p>Now you have access to Pragpath marketplace. Enjoy the enhanced experience!</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="header">
                        <h2>Try ProgPath Premium{!isTrialUsed && freePlan && `, Free For ${freePlan?.durationValue} ${getDurationUnit(freePlan?.durationValue, freePlan?.durationType)}`}</h2>
                
                        <div className='features'>
                            <div className='normal'>
                                <h4>Normal Users</h4>        
                                <p><i className="bi bi-emoji-smile-upside-down"></i>No Access to Upload in Marketplace</p>
                                <p><i className="bi bi-emoji-smile-upside-down"></i>Limited to 10 Workspaces</p>
                                <p><i className="bi bi-emoji-smile-upside-down"></i>Limited to 10 Collaborators</p>            
                            </div>
                            <div className='premium'>
                                <h4>Premium Users</h4>        
                                <p><i className='bi bi-check-circle-fill'></i>Access to Upload in Marketplace</p>
                                <p><i className='bi bi-check-circle-fill'></i>Create Unlimited Workspace</p>
                                <p><i className='bi bi-check-circle-fill'></i>Create Unlimited Collaborators</p>
                            </div>
                        </div>

                        <p style={{fontWeight: 'lighter'}}>Join our exclusive community to upload and market your project ideas on ProgPath</p>
                    </div>
                )
            }

            
            {subscribed && <h3 style={{textAlign: 'center'}}>Upgrade plan</h3>}
            <div className="cards">
                {
                    freePlan && !isTrialUsed && (
                        <div className='card'>
                            <h4>{freePlan?.title || 'Trial'}</h4>
                            <div>
                                <h3>Get Free <br /> For {freePlan.durationValue} {getDurationUnit(freePlan.durationValue, freePlan.durationType)}</h3>
                            </div>
                            <button onClick={() => subscribeToTrial(freePlan._id)} className='btn-primary' style={{backgroundColor: 'var(--color-blue)'}}>START NOW</button>
                        </div>
                    )
                }

                {
                    pricedPlans.length > 0 && (
                        pricedPlans.map ((plan:any) => (
                            <div key={plan?._id} className='card'>
                                <h4>{plan?.title}</h4>
                                <div>
                                    <h1>₹ {plan?.price}/</h1><small>{plan.durationValue} {getDurationUnit(plan.durationValue, plan.durationType)}</small>
                                </div>
                                <button onClick={(e)=> handleSubscribe(e, plan.price, plan._id)} className='btn-primary'>GET NOW</button>
                            </div>
                        ))
                    )
                }            
            </div>
        </div>
    </div>
  )
}

export default Subscription