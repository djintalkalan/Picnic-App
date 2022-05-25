import ActionTypes, { action } from "app-store/action-types";

//@ts-ignore
const initialCreateEventState: ICreateEventReducer = {}

interface Location {
    type: string;
    coordinates: number[];
}

export interface TicketPlan {
    name: string;
    amount: number;
    event_tax_rate: number;
    event_tax_amount: number;
    currency: string;
    description: string;
}

export interface ICreateEventReducer {
    _id?: string;
    user_id?: string;
    name?: string;
    location?: Location;
    status: number;
    short_description: string;
    address: string;
    details: string;
    city: string;
    state: string;
    country: string;
    image: string;
    group_id: string;
    is_public: number;
    is_online_event: number;
    is_free_event: number;
    capacity_type: string;
    event_date: string;
    event_end_date: string
    event_start_time: string;
    event_end_time: string;
    event_currency: string;
    event_refund_policy: string;
    payment_method: string[];
    payment_email: string;
    event_tax_amount: number;
    event_tax_rate: number;
    creator_of_event: any;
    event_group: any;
    capacity: number;
    event_fees: number;
    is_multi_day_event: number;
    ticket_type: string;
    ticket_plans: TicketPlan[];

}

export const createEventReducer = (state: ICreateEventReducer = initialCreateEventState, action: action): ICreateEventReducer => {
    switch (action.type) {
        case ActionTypes.SET_CREATE_EVENT_DATA:
            return action.payload

        case ActionTypes.UPDATE_CREATE_EVENT_DATA:
            return { ...state, ...action.payload }
        case ActionTypes.RESET_CREATE_EVENT_DATA:
        case ActionTypes.RESET_STATE_ON_LOGIN:
        case ActionTypes.RESET_STATE_ON_LOGOUT:
            //@ts-ignore
            return {}
        default:
            return state
    }
}