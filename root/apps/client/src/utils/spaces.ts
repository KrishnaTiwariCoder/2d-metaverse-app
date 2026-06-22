import api from "./axios"

export const getAllSpacesAndMaps = () =>{
    return api.get("/space/all").then(response =>{
        const data = response.data;
        if(response.status==200 && data.spaces){
            return {spaces: data.spaces, maps: data.maps , elements: data.elements};
        } else {
            return {spaces: [], maps: [], elements: []};
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
    return api.delete(`/space/` , {
        data: {
            spaceId
        }
    }).then(response =>{
        return response;
    }).catch(error=>{
        return error.response;
    })
}

export const findSpaceById = (spaceId: string) =>{
    return api.get(`/space/${spaceId}`).then(response =>{
        const data = response.data; 
        return data.space;
    }).catch(error=>{
        console.log(error);
        return error.response;
    })
}

export const addElementToSpace = (spaceId: string, element: any) =>{
    return api.post(`/space/element`, {
            spaceId,
            elementId:element.element._id,
            x: element.x,
            y: element.y
    }).then(response =>{
        return response;
    }).catch(error=>{
        console.log(error);
        return error.response;
    })
}