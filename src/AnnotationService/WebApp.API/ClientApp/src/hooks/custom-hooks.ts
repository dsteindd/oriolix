import {useEffect, useState} from "react";
import {ProjectLabels} from "../models/label-set";
import {labelSetService} from "../services/ApiService";
import authService from "../components/api-authorization/AuthorizeService";


export const useProjectLabels = (projectId: string) => {
       
    
    const [labels, setLabels] = useState<ProjectLabels>();
    
    useEffect(() => {
        const _fetchLabels = async () => {
            const token = await authService.getAccessToken();
            return await labelSetService.getProjectLabels(token, projectId);
        };
        
        _fetchLabels().then(labels => {
            setLabels(labels);
        })
        
        
    }, [projectId])
    
    return labels ?? {
        primary: [],
        secondary: []
    };
}