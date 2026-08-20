import axios from 'axios';

const api = axios.create({
    baseURL:'http://localhost:5000/'
})

export const getData = async ()=>{
    const response = await api.get('/');
    return response.data.message;
}