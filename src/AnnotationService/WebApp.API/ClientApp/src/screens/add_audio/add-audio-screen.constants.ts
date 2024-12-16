import * as yup from 'yup';
import {getFileExtension} from "../../utils/formatting/file-extensions";

export const addAudioScreenSchema = yup.object().shape({
    latitude: yup.number().lessThan(90).moreThan(-90),
    longitude: yup.number().lessThan(180).moreThan(-180),
    file: yup.mixed()
        .required("File is required")
        .test(
            "Format",
            "Only .wav or .flac files are supported",
            (value) => {
                // Don't return an error here, if file is not defined
                if (!value) return true;

                // return error if file with no extension has been chosen
                const fileExt = value.name && getFileExtension(value.name);

                if (!fileExt) return false;


                return supportedFileEndings.includes(fileExt);
            }
        ),
    recordingStart: yup.date()
});

const supportedFileEndings = [
    "wav",
    "mp3",
    "flac",
]

export const tryGetDateTimeFromFileName: (fileName: string) => Date | undefined = (fileName: string) => {
    if (isAudioMothFormat(fileName)) {
        return destructureAudioMothFileName(fileName);
    }

    return undefined;
}

const isAudioMothFormat = (fileName: string) => {
    const testRegex = /[0-9]{8}_[0-9]{6}(.wav|.mp3|.flac|.WAV|.MP3|.FLAC)/

    return testRegex.test(fileName);
}

const destructureAudioMothFileName = (fileName: string) => {
    const destructureRegex = /^([0-9]{4})([0-9]{2})([0-9]{2})_([0-9]{2})([0-9]{2})([0-9]{2})(.wav|.mp3|.flac|.WAV|.MP3|.FLAC)$/;

    const [year, month, day, hour, minute, second] = destructureRegex.exec(fileName)!.slice(1, -1).map(stringVal => parseInt(stringVal));

    return new Date(year, month - 1, day, hour, minute, second);


}