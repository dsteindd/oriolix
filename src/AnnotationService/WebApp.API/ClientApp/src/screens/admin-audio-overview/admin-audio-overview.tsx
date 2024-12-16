import React, {useEffect, useState} from 'react';
import authService from '../../components/api-authorization/AuthorizeService'
import "./admin-audio-overview.css"

import {adminService} from '../../services/ApiService';
import {useNavigate} from 'react-router';
import {FileDownload, FileInfo} from '../../models/file-info';
import {Button, Table} from 'react-bootstrap';
import {User} from '../../models/user';
import fileDownload from "js-file-download";
import {BsDownload} from "react-icons/bs";

interface IState {
    fileInfos: FileInfo[],
    loading: boolean
}

const initialState: IState = {
    fileInfos: [],
    loading: true,
}

interface IProps {
}

const _fetchFileInfos = async (): Promise<FileInfo[]> => {
    const token = await authService.getAccessToken();
    const response = await adminService.getFiles(token!);

    return response;
}

const AdminAudioOverview: React.FC = () => {


    const [state, setState] = useState<IState>(initialState);

    const navigate = useNavigate();

    useEffect(() => {
        _fetchFileInfos()
            .then((fileInfos) => {
                setState((prevState) => {
                    return {
                        loading: false,
                        fileInfos: fileInfos,
                        modal: {
                            id: undefined,
                            isOpen: false
                        }
                    }
                })
            });
    }, [])

    const _renderFileInfos = (): JSX.Element => {
        return (
            <div>
                <Table className='striped bordered '>
                    <thead className='text-center text-justify'>
                    <tr>
                        <th className='text-center text-justify'>Name</th>
                        <th className='text-center text-justify'>Owner</th>
                        <th className='text-center text-justify'>Upload Time</th>
                        <th className='text-center text-justify'>Recording Start</th>
                        <th className='text-center text-justify'># Annotations </th>
                        <th className='text-center text-justify'>Annotations</th>
                        <th className='text-center text-justify'>Download</th>
                        {/*<th className='text-center text-justify'>Delete</th>*/}
                    </tr>
                    </thead>
                    <tbody>
                    {state.fileInfos.map(fileInfo => _buildRow(fileInfo))}
                    </tbody>
                </Table>
            </div>
        );
    }

    const _downloadAllAnnotations = async (): Promise<void> => {
        const token = await authService.getAccessToken();
        const download: FileDownload = await adminService.downloadAnnotations(token!);
        fileDownload(await download.content, download.fileName);
    }
    
    const _downloadAnnotationsOfFile = async (id: string) : Promise<void> => {
        const token = await authService.getAccessToken();
        const download: FileDownload = await adminService.downloadAnnotationsOfFile(token!, id)
        fileDownload(await download.content, download.fileName)
    }

    const _buildRow = ({id, name, numAnnotations, startedOn, uploadedOn, ownerId}: FileInfo): JSX.Element => {

        return (
            <tr key={id}>
                <td>
                    {name}
                </td>
                <td className='text-center text-justify'>
                    <OwnerCell ownerId={ownerId}/>
                </td>
                <td className='text-center text-justify'>
                    {uploadedOn ? new Date(uploadedOn).toLocaleString() : '-'}
                </td>
                <td className='text-center text-justify'>
                    {startedOn ? new Date(startedOn).toLocaleString() : '-'}
                </td>
                <td className='text-center text-justify'>
                    {numAnnotations}
                </td>
                <td className='text-center text-justify'>
                    <Button variant="secondary" onClick={() => navigate("/admin-files/" + id)}>View Annotations</Button>
                    {/* <Link to={id}>Annotate</Link> */}
                </td>
                <td className='text-center text-justify'>
                    <Button variant="primary" onClick={() => _downloadAnnotationsOfFile(id)}><BsDownload/></Button>
                </td>
                {/*<td className='text-center text-justify'>*/}
                {/*    <Button variant="danger" onClick={() => _onFileDelete(id)}>-</Button>*/}
                {/*</td>*/}
            </tr>
        )
    }

    const _onFileDelete = async (id: string): Promise<void> => {
        const token = await authService.getAccessToken();
        await adminService.deleteFile(token!, id);

        var data = await _fetchFileInfos();
        setState({
            fileInfos: data,
            loading: false,
        });
    }

    let contents = state.loading
        ? <p><em>Loading...</em></p>
        : _renderFileInfos();

    return (
        <div>
            <h1>File Infos</h1>
            <Button variant="success" onClick={() => _downloadAllAnnotations()}>Download Annotations</Button>
            {contents}
        </div>
    );
}

const OwnerCell = ({ownerId}: { ownerId: string }) => {

    const [user, setUser] = useState<User>();

    useEffect(() => {
        const _fetchUser = async (id: string) => {
            var token = await authService.getAccessToken();
            var user = await adminService.getUserById(token, id);
            return user;
        }

        _fetchUser(ownerId).then(user => {
            setUser(user);
        })


    }, [])

    if (!user) {
        return (
            <div></div>
        )
    }

    return (
        <div>
            {user.mail}
        </div>
    )
}

export {AdminAudioOverview};