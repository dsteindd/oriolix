import * as yup from 'yup';
import {isEmailValid} from '../../../helpers/validation';


export const shareModalSchema = (sharedMails: string[]) => yup.object().shape({
    mail: yup.string().required().test(
        "RegEx",
        "Invalid Mail",
        (mail: string | undefined) => {
            if (!mail) return false;
            return isEmailValid(mail);
        }
    )
        .test(
            "Multiple Shares",
            "Already shared with this mail",
            (mail: string | undefined) => {
                if (!mail) return false;
                return !sharedMails.includes(mail);
            }
        )
})