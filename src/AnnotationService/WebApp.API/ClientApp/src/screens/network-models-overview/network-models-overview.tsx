import React, {useEffect, useState} from 'react';
import authService from "../../components/api-authorization/AuthorizeService";
import {Button} from "react-bootstrap";
import {useNavigate} from "react-router";
import {NetworkModel} from "../../models/network-models";
import {networkService} from "../../services/ApiService";
import {NetworkList} from "./network-model-list/networks-list";


const _fetchNetworks = async () => {
    const token = await authService.getAccessToken();
    return await networkService.getModels(token);
}

export const NetworkModelsOverview: React.FC = () => {

    const [loading, setLoading] = useState(true)
    const [networks, setNetworks] = useState<NetworkModel[]>([]);

    const navigate = useNavigate();

    

    useEffect(() => {
        _fetchNetworks().then(resultSets => {
            setNetworks(resultSets);
            setLoading(false);
        }).catch((_) => {
            setLoading(false)
        });

    }, [])

    const _renderAddNetworks = () => {
        return (
            <div
                className="d-flex flex-column align-items-center">
                <p>Looks like you don't have any usable network models yet. Start by adding a new one...</p>
                <Button onClick={() => navigate("/networks/add")}>Ok, let's add one</Button>
            </div>
        )
    }

    return loading ? (
        <div>Loading</div>
    ) : networks.length === 0 ?
        _renderAddNetworks() :
        <>
            <div className="d-flex justify-content-end">
                <Button
                    variant="success"
                    onClick={() => navigate("/networks/add")}
                >Add Network Model</Button>
            </div>
            <NetworkList
                networks={networks}
                handleClick={(networkId) => {navigate(`/networks/${networkId}/edit`)}}
                handleEditClick={(networkId) => {navigate(`/networks/${networkId}/edit`)}}
                handleDeleteClick={async (networkId) => {
                    const token = await authService.getAccessToken();
                    
                    await networkService.deleteModel(token, networkId)
                    setLoading(true)
                    _fetchNetworks().then(resultSets => {
                        setNetworks(resultSets);
                        setLoading(false);
                    }).catch((_) => {
                        setLoading(false)
                    });
                }}
            />
        </>
}