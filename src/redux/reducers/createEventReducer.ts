import ActionTypes, { action } from "app-store/action-types";

//@ts-ignore
const initialCreateEventState: ICreateEventReducer = {}

interface Location {
    type: string;
    coordinates: number[];
}

export interface TicketPlan {
    _id: string
    name: string;
    amount: number;
    event_tax_rate: number;
    event_tax_amount: number;
    currency: string;
    description: string;
    status: number;
    sales_ends_on?: string;
    total_free_tickets?: string
    capacity: string
    capacity_type: string
}

export interface ICreateEventReducer {
    _id?: string;
    name: string;
    location: Location;
    short_description: string;
    address: string;
    details: string;
    city: string;
    state: string;
    country: string;
    image: any;
    event_images: Array<any>;
    group_id: string;
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
    capacity: number;
    event_fees: number;
    is_multi_day_event: number;
    ticket_type: string;
    ticket_plans: TicketPlan[];
    is_donation_enabled: number;
    donation_description: string;
    is_copied_event: string;
    payment_api_username: string;
    payment_api_password: string;
    payment_api_signature: string;
    sales_ends_on?: string;
    total_free_tickets?: string
    is_direction: string;
    event_start_date_time: string
    event_end_date_time: string
}

export const createEventReducer = (state: ICreateEventReducer = initialCreateEventState, action: action): ICreateEventReducer => {
    switch (action.type) {
        case ActionTypes.SET_CREATE_EVENT_DATA:
            return deleteExtraKeys({ ...action.payload })
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

const deleteExtraKeys = (d: any) => {
    delete d.user_id
    delete d.status
    delete d.event_canceled_date
    delete d.is_public
    delete d.creator_of_event
    delete d.my_tickets
    delete d.is_event_pinned_by_me
    delete d.total_event_members_count
    delete d.is_event_member
    delete d.total_sold_tickets
    delete d.is_ticket_purchased_by_me
    delete d.is_admin
    delete d.is_event_admin
    delete d.background_color
    return d
}