import React, {useEffect} from 'react';
import "./project-overview.css"

import {useNavigate} from 'react-router';
import {Button} from 'react-bootstrap';
import {useAppDispatch, useAppSelector} from "../../redux/hooks/hooks";
import {fetchProjects} from "../../redux/slices/projects-slice";
import {ProjectList} from "./project-list/project-list";


export const ProjectOverview: React.FC = () => {
    const projects = useAppSelector(state => state.projects.projects);
    const dispatch = useAppDispatch();


    useEffect(() => {
        dispatch(fetchProjects())
    }, [projects.loading, dispatch])

    const navigate = useNavigate();
    const _renderAddProject = () => {
        return (
            <div
                className="d-flex flex-column align-items-center">
                <p>Looks like you don't have any projects yet. Start by adding a new one...</p>
                <Button onClick={() => navigate("/add-project")}>Ok, let's add one</Button>
            </div>
        )
    }
    
    let contents = projects.loading !== "succeeded"
        ? <p><em>Loading...</em></p>
        : (
            projects.data.length === 0 ?
                _renderAddProject() :
                <>
                    <div className="d-flex justify-content-end">
                        <Button 
                            variant="success"
                            onClick={() => navigate("/add-project")}
                        >Add Project</Button>
                    </div>
                    <ProjectList 
                        projects={projects.data}
                        handleClick={(projectId) => navigate(`/projects/${projectId}/files`)}
                    />
                </>
        )

    return (
        <div>
            {contents}
        </div>
    );
}