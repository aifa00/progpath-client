import axios from 'axios';
import store from './redux/store';
import { removeUser } from './redux/userSlice';
import { setAlert } from './redux/alertSlice';
import { setNetworkError, setServerError } from './redux/errorSlice';
import { notify } from './redux/notifySlice';


const dispatch = store.dispatch;


// instance of Axios
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
});

// request interceptor
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {

  // error is passed along to the catch block of the Axios request that triggered the interceptor.
  return Promise.reject(error);
});


// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    const status = error.response ? error.response.status : null;
 
    if (error.response && status === 403) {
      dispatch(removeUser());
    } else if (error.response && status === 401 || status === 404 || status === 400 || status === 409) {
      if(error.response.data.notify) {
        dispatch(notify({message: error.response.data.message, type: 'error'}));
      } else {
        dispatch(setAlert({message: error.response.data.message, type: 'error'}));
      }      
    } else if (error.response && status === 500) {
      dispatch(setServerError()); 
    } else if (error.request) {
      dispatch(setNetworkError());
    } else if (error.response) {
      dispatch(setAlert({message: error.response.data.message, type: 'error'}));
    } else {
      dispatch(setAlert({message: 'Something went wrong, please try again !', type: 'error'}));
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
