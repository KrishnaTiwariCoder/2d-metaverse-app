import api from "./axios";


export const signup =  (username:string, password:string)=>{
    return api.post("/signup", {username, password, type:"user"}).then(response =>{
        const {userId} = response.data;
        if(!userId){
            throw new Error("Failed to signup");
            return;
        }
        return 1;
    }).catch(error=>{
        console.error(error);
        return 0;
    });
}

export const signin = (username:string, password:string)=>{
    return api.post("/signin", {username, password}).then(response =>{
        const {token, user} = response.data;
        if(!token){
            throw new Error("Failed to signin");
            return;
        }
        return {token, user};
    }).catch(error=>{
        console.error(error);
        return {token: "", user: {_id: "", username: ""}};
    });
}

export const getMe = () => {
    return api.get("/me").then(response =>response).catch(error=>{
        console.error(error);
        return error;
    });
}

export const signout = () => {  
    return api.post("/signout").then(response =>response).catch(error=>{
        console.error(error);
        return error;
    });
}