import{fetchBaseQuery} from "@reduxjs/toolkit/query/react"
import conf from "../conf/conf.js";


export const baseApi = fetchBaseQuery({
    baseUrl: conf.backendUrl,
    prepareHeaders: (headers,{endpoint})=>{
        const token = localStorage.getItem('token');
        const noAuthEndPoints = [
            'registerUser', 'loginUser', 'refreshAccessToken' ,'getAllVideos'
        ]

        if (!noAuthEndPoints.includes(endpoint) && token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
    }
})