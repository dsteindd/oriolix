import React, {useState} from 'react';
import './usage-info.css';
import {Button, Modal} from "react-bootstrap";


export const UsageInfo: React.FC = () => {

    const [show, setShow] = useState(false);

    return (
        <div>
            <Button className="info-button" onClick={() => setShow(true)}>
                <p className="text-xl-center fw-bold justify-content-center">?</p>
            </Button>

            <Modal show={show}
                   onBackdropClick={() => setShow(false)}
                   onHide={() => setShow(false)}
                   size="xl">
                <Modal.Header>
                    <h1>Command Descriptions</h1>
                </Modal.Header>
                <Modal.Body>
                    <table className="info-table">
                        <tbody>
                            <tr>
                                <td><kbd>alt</kbd> + <kbd>mouse wheel</kbd></td>
                                <td>Pan Time</td>
                            </tr>
                            <tr>
                                <td><kbd>alt</kbd> + <kbd>shift</kbd> + <kbd>mouse wheel</kbd></td>
                                <td>Pan Frequency</td>
                            </tr>
                            <tr>
                                <td><kbd>mouse wheel</kbd></td>
                                <td>Zoom Time and Frequency</td>
                            </tr>
                            <tr>
                                <td><kbd>ctrl</kbd> + <kbd>mouse wheel</kbd></td>
                                <td>Zoom Time</td>
                            </tr>
                            <tr>
                                <td><kbd>ctrl</kbd> + <kbd>shift</kbd> + <kbd>mouse wheel</kbd></td>
                                <td>Zoom Frequency</td>
                            </tr>
                            <tr>
                                <td><kbd>left click</kbd> (with draw tool selected)</td>
                                <td>Draw Point</td>
                            </tr>
                            <tr>
                                <td><kbd>p</kbd></td>
                                <td>Polygon Draw Tool (only if species selected)</td>
                            </tr>
                            <tr>
                                <td><kbd>r</kbd></td>
                                <td>Rectangle Draw Tool (only if species selected)</td>
                            </tr>
                            <tr>
                                <td><kbd>l</kbd></td>
                                <td>Free Hand Draw Tool (only if species selected)</td>
                            </tr>
                            <tr>
                                <td><kbd>right click</kbd></td>
                                <td>Accept annotation</td>
                            </tr>
                            <tr>
                                <td><kbd>strg</kbd>+<kbd>z</kbd></td>
                                <td>Remove last annotation</td>
                            </tr>
                            <tr>
                                <td><kbd>d</kbd></td>
                                <td>Delete Mode</td>
                            </tr>
                            <tr>
                                <td><kbd>left click</kbd> (with delete mode)</td>
                                <td>Deletes the annotation clicked in</td>
                            </tr>
                            <tr>
                                <td><kbd>space</kbd></td>
                                <td>Play/Resume/Pause Playback of current spectrogram excerpt</td>
                            </tr>
                        </tbody>
                    </table>
                </Modal.Body>
                <Modal.Footer>
                </Modal.Footer>

            </Modal>


        </div>
    )
}