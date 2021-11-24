import { RegisterOptions } from "react-hook-form";
import Language from "src/language/Language";

const REGX_EMAIL = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const REGX_NUMBER = /^[0-9]+$/;

const REGX_PASSWORD = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\s]).{8,}$/
// const REGX_PASSWORD = /(?=^.{8,}$)/

export const EmailValidations: Exclude<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs'> = {
    required: Language.email_required,
    pattern: {
        value: REGX_EMAIL,
        message: Language.invalid_email
    },
}

export const PasswordValidations: Exclude<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs'> = {
    required: Language.password_required,
    pattern: {
        value: REGX_PASSWORD,
        message: Language.must_be_eight
    },
}

export const validateEmail = (email: string) => {
    return REGX_EMAIL.test(email);
}

export const validateNumber = (phone: string) => {
    return REGX_NUMBER.test(phone)
}

export const validatePhoneOrEmail = (s: string) => {
    return (validateNumber(s) || validateEmail(s))
}