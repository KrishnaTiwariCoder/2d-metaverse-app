import api from "./axios"

export const getAllSpacesAndMaps = () =>{
    return api.get("/space/all").then(response =>{
        const data = response.data;
        if(response.status==200 && data.spaces){
            return {spaces: data.spaces, maps: data.maps};
        } else {
            return {spaces: [], maps: []};
        }
    }).catch(error=>{
        console.log(error);
        return [];
    })
}

export const createSpace = (space: any) =>{
    return api.post("/space", space).then(response =>{
        console.log(response);
        return response.data;
    }).catch(error=>{
        console.log(error);
        return null;
    })
}

export const deleteSpace = (spaceId: string) =>{
    return api.delete(`/space/${spaceId}`).then(response =>{
        console.log(response);
        return response.data;
    }).catch(error=>{
        console.log(error);
        return null;
    })
}

