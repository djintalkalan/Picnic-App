import { IPaginationState } from "app-store/actions";
import Language from "src/language/Language";

export const PROFILE_IMAGE_PICKER_OPTIONS = {
    width: 800,
    height: 800,
    compressImageQuality: 1,
    compressImageMaxWidth: 800,
    compressImageMaxHeight: 800,
    enableRotationGesture: true,
    cropping: true,
    loadingLabelText: Language.getString("processing", Language.getLanguage()),
    cropperCircleOverlay: true,
}

export const INITIAL_PAGINATION_STATE: IPaginationState = {
    currentPage: 0,
    totalPages: -1,
    perPage: 20
}

export const CHAT_BACKGROUND_COLORS = [
    '#E1F3E2',
    '#F3E1E1',
    '#F0E1F3',
    '#F3F3E1',
    '#E1F3F2',
    '#E1E3F3',
]

export const DEFAULT_CHAT_BACKGROUND = '#DFDFDF'