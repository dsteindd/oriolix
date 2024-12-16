import {
    Box, FormControlLabel,
    IconButton,
    Paper, Rating, Switch,
    Table, TableBody,
    TableCell,
    TableContainer,
    TableHead, TablePagination,
    TableRow,
    Toolbar,
    Typography
} from "@mui/material";
import {AiFillCaretLeft, AiFillCaretRight, AiFillEye, AiOutlineEye} from "react-icons/ai";
import React, {useEffect, useState} from "react";
import {GiHummingbird} from "react-icons/gi";
import {Annotation} from "../../../models/annotations";


interface IUserAnnotationTableProps {
    annotations: Annotation[],
    follow?: boolean,
    onFollowChange?: (value: boolean) => void,
    onSelectedAnnotationChange?: (annotation: Annotation) => void,
    onAnnotationConfidenceChange?: (annotation: Annotation, newConfidence: number) => void,
    onSwitchShowAll?: (showAll: boolean) => void,
    showAll: boolean
}

export const UserAnnotationTable: React.FC<IUserAnnotationTableProps> = ({
                                                                             annotations,
                                                                             follow,
                                                                             onFollowChange,
                                                                             onSelectedAnnotationChange,
                                                                             onAnnotationConfidenceChange,
                                                                             onSwitchShowAll,
                                                                             showAll
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
        if (onSelectedAnnotationChange && (selectedClassification !== undefined)) {
            onSelectedAnnotationChange(annotations[selectedClassification])
        }
    }, [selectedClassification])

    const _getAnnotationFromTime = (annotation: Annotation) => {
        return Math.min(
            ...annotation
                .points
                .map(p => p.time)
        )
    }

    const _getAnnotationToTime = (annotation: Annotation) => {
        return Math.max(
            ...annotation
                .points
                .map(p => p.time)
        )
    }

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
                        Your Annotations
                    </Typography>
                    <FormControlLabel label={showAll ? "All" : "Own"}
                                      control={
                                          <Switch
                                              defaultChecked
                                              onChange={(value) => {
                                                  onSwitchShowAll && onSwitchShowAll(value.target.checked)
                                              }}
                                          />
                                      }/>
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
                                const pageEndIndex = Math.min(rowsPerPage * (page + 1) - 1, annotations.length - 1)
                                const hasNextPage = pageEndIndex < annotations.length - 1;

                                if (selectedClassification === undefined) {
                                    setSelectedClassification(pageStartIndex)
                                } else if (selectedClassification == pageEndIndex) {
                                    // Do nothing
                                    // switch to next page and set correct index
                                    if (hasNextPage) {
                                        setPage(prevPage => Math.min(Math.ceil(annotations.length / rowsPerPage), prevPage + 1));
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
                                <TableCell align="right">Confidence</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                annotations
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
                                                <TableCell align="right">{_getAnnotationFromTime(c).toFixed(2)}s
                                                    - {_getAnnotationToTime(c).toFixed(2)}s</TableCell>
                                                <TableCell
                                                    align="right">
                                                    {
                                                        c.primaryLabel.name
                                                    }
                                                </TableCell>
                                                <TableCell
                                                    align="right">
                                                    <Rating value={c.confidence}
                                                            icon={
                                                                <GiHummingbird color='#000' fontSize="inherit"/>
                                                            }
                                                            emptyIcon=
                                                                {
                                                                    <GiHummingbird color='#ddd' fontSize="inherit"/>
                                                                }
                                                            onChange={(event, value) => {
                                                                event.preventDefault();
                                                                event.stopPropagation()
                                                                if (!!value) {
                                                                    onAnnotationConfidenceChange && onAnnotationConfidenceChange(c, value)
                                                                }
                                                            }}
                                                            disabled={!c.isOwned}
                                                    />
                                                </TableCell>
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
                    count={annotations.length}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    onPageChange={handleChangePage}
                />
            </Paper>
        </Box>
    )
}