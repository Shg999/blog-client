import axios from 'axios';
import { getAccessToken, getType } from '../utils/common-utils';
import { API_NOTIFICATION_MESSAGES, SERVICE_URLS } from '../constants/config';
const API_URL="http://ec2-3-109-206-70.ap-south-1.compute.amazonaws.com:8000/";

const axiosInstance=axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        "Accept" : "application/json,Form-Data",
        "Content-Type": "application/json"
    }
});
axiosInstance.interceptors.request.use(
     function (config){
        if(config.TYPE.params){
            config.params = config.TYPE.params;
        } else if(config.TYPE.query){
            config.url = config.url + '/' + config.TYPE.query;
        }
        return config;
     },
     function (error){
        return Promise.reject(error);
     }
)

axiosInstance.interceptors.response.use(
    function (response){
        //Stop global loader here
       return processResponse(response);
    },
    function (error){
        //Stop global loader here
       return Promise.reject(processError(error));
    }
)

const processResponse = (response) =>{
    if(response?.status === 200){
        return{isSuccess: true,data: response.data}
    }
    else{
        return {
            isFailure: true,
            status: response?.status,
            msg: response?.msg,
            code: response?.code
        }
    }
}

const processError = (error)=>{
     if(error.response){
//Request made and server responded with a status that falls out of range 2.x.x
console.log("Error in response", error.toJSON())
     return{
        isError: true,
        msg: API_NOTIFICATION_MESSAGES.responseFailure,
        code: error.response.status
     }
     }
     else if(error.request){
//Request made but no response received
console.log("Error in request", error.toJSON())
     return{
        isError: true,
        msg: API_NOTIFICATION_MESSAGES.requestFailure,
        code: ""
     }
     }
     else{
//Something happenned in setting up request that triggers an error
console.log("Error in network:", error.toJSON())
     return{
        isError: true,
        msg: API_NOTIFICATION_MESSAGES.NetworkError,
        code: ""
     }
     }
}

const API={};

for(const [key,value] of Object.entries(SERVICE_URLS)){
    API[key] = (body, showUploadProgress, showDownloadProgress)=>
        axiosInstance({
            method: value.method,
            url: value.url,
            data: value.method === 'DELETE' ? {} : body,
            responseType: value.responseType,
            headers : {
                  authorization: getAccessToken()
            },
            TYPE: getType(value, body),
            onUploadProgress: function(progressEvent){
                if(showUploadProgress){
                    let percentageCompleted=Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    showUploadProgress(percentageCompleted)
                }
            },

            onDownloadProgress: function(progressEvent){
                if(showDownloadProgress){
                    let percentageCompleted=Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    showDownloadProgress(percentageCompleted)
                }
            }
        });
    }
export {API};