import React from 'react'
import {ITool} from "../tools";
import "./tool-info-box.css"
import {Box, Divider} from "@mui/material";
import {CenterFocusStrong, Delete} from "@mui/icons-material";

interface ToolInfoBoxProps {
    tool?: ITool,
    isDeleteMode?: boolean
}

export const ToolInfoBox: React.FC<ToolInfoBoxProps> = ({
                                                            tool,
                                                            isDeleteMode
                                                        }) => {

    const getIcon = () => {
        if (tool) return tool.renderIcon();
        if (!tool && isDeleteMode) return <Delete/>
        return <CenterFocusStrong/>
    }

    return (
        <Box>
            Tool
            <Divider/>
            <Box sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                paddingTop: "8px"
            }}>
                {getIcon()}
            </Box>
        </Box>
        // <div className="tool-box">
        //     <div style={titleStyle}>Tool</div>
        //     <div style={{display: "flex"}} title={tool ? "Draw: " + tool.name : "Navigation"}>
        //         {getIcon()}
        //     </div>
        // </div>
    )

}