import axios from "axios";

export const axiosInstance = axios.create({
    baseURL : 'http://localhost:3000',

    headers : {
        
    }
});


export const adminAxiosInstance = axios.create({
    baseURL : 'http://localhost:3000/admin' , 

    headers : {

    }
});