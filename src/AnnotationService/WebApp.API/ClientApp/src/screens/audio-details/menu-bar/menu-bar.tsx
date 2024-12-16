import React from "react";
import {GrPowerReset} from "react-icons/gr";
import "./menu-bar.css"
import {ToolInfoBox} from "../spectrogram-chart/tool-info-box/tool-info-box";
import {ITool} from "../spectrogram-chart/tools";
import {AudioPlayButton} from "../../../components/ui/audio/audio-play-button";
import {Label} from "../../../models/label-set";
import {useProjectLabels} from "../../../hooks/custom-hooks";
import {useParams} from "react-router";
import {
    Autocomplete,
    Box,
    Checkbox,
    IconButton,
    ListItem,
    ListItemText,
    Slider,
    TextField
} from "@mui/material";
import {
    Gradient,
    GradientOutlined,
    InvertColors,
    InvertColorsOff,
} from "@mui/icons-material";
import {matchSorter} from "match-sorter";

interface MenuBarProps {
    src: string,
    minT: number,
    maxT: number,
    onPlaybackChanged: (time: number) => void,
    isDenoised: boolean,
    onDenoiseSwitch: () => void,
    isThresholded: boolean,
    onThresholdSwitch: () => void,
    isInverted: boolean,
    onInvertSwitch: () => void,
    onResetAxis?: () => void,
    selectedPrimaryLabel?: Label,
    onChangeSelectedPrimaryLabel?: (bird: Label | undefined) => void,
    selectedSecondaryLabel?: Label,
    onChangeSelectedSecondaryLabel?: (type: Label | undefined) => void,
    thresholdMin?: number,
    thresholdMax?: number,
    onThresholdChange?: (thresholdMin: number, thresholdMax: number) => void;
    tool?: ITool,
    isDeleteMode?: boolean
}


export const MenuBar: React.FC<MenuBarProps> = ({
                                                    src,
                                                    minT,
                                                    maxT,
                                                    onPlaybackChanged,
                                                    isDenoised,
                                                    onDenoiseSwitch,
                                                    isThresholded,
                                                    onThresholdSwitch,
                                                    isInverted,
                                                    onInvertSwitch,
                                                    onResetAxis,
                                                    selectedPrimaryLabel,
                                                    onChangeSelectedPrimaryLabel,
                                                    selectedSecondaryLabel,
                                                    onChangeSelectedSecondaryLabel,
                                                    thresholdMin,
                                                    thresholdMax,
                                                    onThresholdChange,
                                                    tool,
                                                    isDeleteMode
                                                }) => {

    const {projectId} = useParams<{ projectId: string }>();

    const {primary, secondary} = useProjectLabels(projectId!);

    const rangeSliderMarks = [
        {
            value: 0,
            label: 0
        },
        {
            value: 255,
            label: 255
        }
    ]
    
    const filterOptions = (options: readonly Label[], {inputValue}: any) => matchSorter(options, inputValue, {keys: ["name", "altName"]});

    return (
        <Box sx={{
            flexDirection: "row",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
        }}>
            <AudioPlayButton
                src={src}
                from={minT}
                to={maxT}
                onListen={onPlaybackChanged}
                listenInterval={10}/>
            <ToolInfoBox tool={tool} isDeleteMode={isDeleteMode}/>
            <IconButton
                size="large"
                about={"Reset the time scale to 0s to 5s"}
                onClick={onResetAxis}
            >
                <GrPowerReset/>
            </IconButton>
            {/*<Checkbox*/}
            {/*    size="medium"*/}
            {/*    icon={<LensBlur/>}*/}
            {/*    checkedIcon={<NoiseAware/>}*/}
            {/*    value={isDenoised}*/}
            {/*    onChange={onDenoiseSwitch}*/}
            {/*/>*/}
            <Checkbox
                size="medium"
                icon={<InvertColors/>}
                checkedIcon={<InvertColorsOff/>}
                value={isInverted}
                onChange={onInvertSwitch}
            />
            <Autocomplete
                disablePortal
                filterOptions={filterOptions}
                id="combo-box-primary"
                sx={{
                    width: 300
                }}
                blurOnSelect
                renderInput={(params) => <TextField {...params} label="Primary Label"/>}
                options={primary}
                onChange={(event, value) => {
                    onChangeSelectedPrimaryLabel && onChangeSelectedPrimaryLabel(value ?? undefined)
                }}
                onKeyDown={(e) => {
                    e.stopPropagation();
                }}
                value={selectedPrimaryLabel}
                renderOption={(props, label) => {
                    return (
                        <ListItem key={label.id} {...props}>
                            <ListItemText
                                primary={label.name}
                                secondary={label.altName}
                            />
                        </ListItem>
                    )
                }}
                getOptionLabel={(label) => {
                    return label.name
                }}
            />

            {
                !!secondary && secondary.length !== 0 ?
                    <Autocomplete
                        filterOptions={filterOptions}
                        disablePortal
                        id="combo-box-primary"
                        sx={{
                            width: 300
                        }}
                        blurOnSelect
                        renderInput={(params) => <TextField {...params} label="Secondary Label"/>}
                        options={secondary}
                        onChange={(event, value) => {
                            onChangeSelectedSecondaryLabel && onChangeSelectedSecondaryLabel(value ?? undefined)
                        }}
                        onKeyDown={(e) => {
                            e.stopPropagation();
                        }}
                        value={selectedSecondaryLabel}
                        renderOption={(props, label) => {
                            return (
                                <ListItem key={label.id} {...props}>
                                    <ListItemText
                                        primary={label.name}
                                        secondary={label.altName}
                                    />
                                </ListItem>
                            )
                        }}
                        getOptionLabel={(label) => {
                            return label.name
                        }}
                    /> : null
            }
            <Checkbox
                size="medium"
                icon={<Gradient/>}
                checkedIcon={<GradientOutlined/>}
                value={isThresholded}
                onChange={onThresholdSwitch}
            />
            <Box sx={{
                paddingLeft: "8px",
                paddingRight: "8px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <Slider
                    sx={{
                        width: 250,
                        marginBottom: "0px"
                    }}
                    getAriaLabel={() => 'Pixel Range'}
                    value={[thresholdMin ?? 0, thresholdMax ?? 255]}
                    onChange={(event: Event, newValue: number | number[]) => {
                        newValue = newValue as number[]
                        onThresholdChange && onThresholdChange(newValue[0], newValue[1])
                    }}
                    valueLabelDisplay="auto"
                    color="primary"
                    disableSwap
                    step={1}
                    min={0}
                    max={255}
                    marks={rangeSliderMarks}
                    size="small"
                />
            </Box>
        </Box>
    )
}
