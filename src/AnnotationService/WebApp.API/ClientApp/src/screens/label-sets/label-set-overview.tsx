import React, {useEffect, useState} from 'react';
import {LabelSet} from "../../models/label-set";
import {labelSetService} from "../../services/ApiService";
import authService from "../../components/api-authorization/AuthorizeService";
import {LabelSetList} from "./label-set-list/label-set-list";
import {Button} from "react-bootstrap";
import {useNavigate} from "react-router";

export const LabelSetOverview: React.FC = () => {

    const [loading, setLoading] = useState(true)
    const [labelSets, setLabelSets] = useState<LabelSet[]>([]);

    const navigate = useNavigate();

    const _fetchLabelSets = async () => {
        const token = await authService.getAccessToken();
        return await labelSetService.getLabelSets(token);
    }
    
    useEffect(() => {
        _fetchLabelSets().then(resultSets => {
            setLabelSets(resultSets);
            setLoading(false);
        }).catch((_) => {
            setLoading(false)
        });
    }, [])

    const _renderAddLabelSet = () => {
        return (
            <div
                className="d-flex flex-column align-items-center">
                <p>Looks like you don't have any label sets yet. Start by adding a new one...</p>
                <Button onClick={() => navigate("/add-label-set")}>Ok, let's add one</Button>
            </div>
        )
    }
    
    const handleDelete = async (labelSetId: string) => {
        const token = await authService.getAccessToken();
        await labelSetService.deleteLabelSet(token, labelSetId);
        _fetchLabelSets().then(resultSets => {
            setLabelSets(resultSets);
            setLoading(false);
        }).catch((_) => {
            setLoading(false)
        });
    }
    
    return loading ? (
        <div>Loading</div>
    ) : labelSets.length === 0 ?
        _renderAddLabelSet() :
        <>
            <div className="d-flex justify-content-end">
                <Button
                    variant="success"
                    onClick={() => navigate("/add-label-set")}
                >Add Label Set</Button>
            </div>
            <LabelSetList
                labelSets={labelSets}
                handleClick={() => {}}
                handleDelete={handleDelete}
            />
        </>
}