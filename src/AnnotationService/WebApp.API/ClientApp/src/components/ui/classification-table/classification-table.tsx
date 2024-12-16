import {Classification} from "../../../models/network-models";
import {
    Box,
    IconButton,
    Paper, Rating,
    Table, TableBody,
    TableCell,
    TableContainer,
    TableHead, TablePagination,
    TableRow,
    Toolbar,
    Typography
} from "@mui/material";
import {AiFillCaretLeft, AiFillCaretRight, AiFillEye, AiOutlineEye} from "react-icons/ai";
import React, {ReactNode, useEffect, useState} from "react";
import {GiHummingbird} from "react-icons/gi";


interface IClassificationTableProps {
    title?: string,
    classifications: Classification[],
    follow?: boolean,
    onFollowChange?: (value: boolean) => void,
    onSelectedClassificationChange?: (classification: Classification) => void,
    extraToolbar?: ReactNode[],
    renderConfidenceFeedback?: boolean
}

export const ClassificationTable: React.FC<IClassificationTableProps> = ({
                                                                             title,
                                                                             classifications,
                                                                             follow,
                                                                             onFollowChange,
                                                                             onSelectedClassificationChange,
                                                                             extraToolbar,
                                                                             renderConfidenceFeedback = true
                                                                         }) => {

    const [selectedClassification, setSelectedClassification] = useState<number | undefined>(undefined);


    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
        setSelectedClassification(undefined)
    };

    useEffect(() => {
        if (onSelectedClassificationChange && (selectedClassification !== undefined)) {
            onSelectedClassificationChange(classifications[selectedClassification])
        }
    }, [selectedClassification])


    return (
        <Box sx={{minWidth: 500, maxWidth: '50%'}}>
            <Paper sx={{width: '100%', mb: 2}}>
                <Toolbar
                    sx={{
                        pl: {sm: 2},
                        pr: {xs: 1, sm: 1},
                        display: 'flex'
                    }}
                >
                    <Typography
                        sx={{flex: '1 1 100%'}}>
                        {title ?? "Classification Report"}
                    </Typography>
                    {extraToolbar}
                    <Box sx={{display: 'flex'}}>
                        <IconButton
                            onKeyUp={(e) => e.preventDefault()}
                            onClick={() => {
                                const pageStartIndex = rowsPerPage * page
                                const hasPreviousPage = pageStartIndex >= rowsPerPage;

                                if (selectedClassification === undefined) {
                                    setSelectedClassification(pageStartIndex)
                                } else if (selectedClassification === pageStartIndex) {
                                    if (hasPreviousPage) {
                                        setPage(prevPage => prevPage - 1);
                                        setSelectedClassification(pageStartIndex - 1)
                                    }
                                } else {
                                    setSelectedClassification(prev => {
                                        if (prev == undefined) return prev;

                                        return prev - 1 < pageStartIndex ? pageStartIndex : prev - 1
                                    })
                                }
                            }
                            }>
                            <AiFillCaretLeft/>
                        </IconButton>
                        <IconButton
                            onKeyUp={(e) => e.preventDefault()}
                            onClick={() => {
                                onFollowChange && (follow !== undefined) && onFollowChange(!follow);
                            }}>
                            {follow ? <AiFillEye/> : <AiOutlineEye/>}
                        </IconButton>
                        <IconButton
                            onKeyUp={(e) => e.preventDefault()}
                            onClick={() => {
                                const pageStartIndex = rowsPerPage * page
                                const pageEndIndex = Math.min(rowsPerPage * (page + 1) - 1, classifications.length - 1)
                                const hasNextPage = pageEndIndex < classifications.length - 1;

                                if (selectedClassification === undefined) {
                                    setSelectedClassification(pageStartIndex)
                                } else if (selectedClassification == pageEndIndex) {
                                    // Do nothing
                                    // switch to next page and set correct index
                                    if (hasNextPage) {
                                        setPage(prevPage => Math.min(Math.ceil(classifications.length / rowsPerPage), prevPage + 1));
                                        setSelectedClassification(pageEndIndex + 1)
                                    }


                                } else {
                                    setSelectedClassification(prev => {
                                        if (prev === undefined) return prev;

                                        return prev + 1 > pageEndIndex ? pageStartIndex : prev + 1;
                                    });
                                }
                            }
                            }>
                            <AiFillCaretRight/>
                        </IconButton>
                    </Box>
                </Toolbar>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell align="right">Time</TableCell>
                                <TableCell align="right">Label</TableCell>
                                {
                                    renderConfidenceFeedback ? <TableCell align="right">Confidence</TableCell> : null
                                }
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                classifications
                                    .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
                                    .map((c, index) => {
                                        let style = {}
                                        if (selectedClassification !== undefined && index == selectedClassification - page * rowsPerPage) {
                                            style = {
                                                backgroundColor: '#ccc'
                                            }
                                        }

                                        const indexInList = index + page * rowsPerPage
                                        return (
                                            <TableRow
                                                onClick={() => {
                                                    setSelectedClassification(indexInList);
                                                }}
                                                key={indexInList}
                                                style={style}>
                                                <TableCell align="right">{c.fromTime.toFixed(2)}s
                                                    - {c.toTime.toFixed(2)}s</TableCell>
                                                <TableCell
                                                    align="right">
                                                    {
                                                        _getLabelString(c)
                                                    }
                                                </TableCell>
                                                {
                                                    renderConfidenceFeedback ? 
                                                        <TableCell
                                                            align="right">
                                                            <Rating value={5}
                                                                icon={
                                                                <GiHummingbird color='#000' fontSize="inherit"/>
                                                            }
                                                                    emptyIcon=
                                                                        {
                                                                <GiHummingbird color='#ddd' fontSize="inherit"/>
                                                            }
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                    }}
                                                            />
                                                        </TableCell> : null
                                                }
                                            </TableRow>
                                        )
                                    })
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10]}
                    component="div"
                    count={classifications.length}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    onPageChange={handleChangePage}
                />
            </Paper>
        </Box>
    )
}

export const _getLabelString = (c: Classification) => {
    if (c.confidence) {
        return `${c.label} (${(100 * c.confidence).toFixed(2)}%)`
    } else {
        return c.label
    }
} 