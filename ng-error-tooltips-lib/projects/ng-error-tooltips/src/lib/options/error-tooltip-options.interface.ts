import { Placement } from "../tooltip/placement.type";


export interface ErrorTooltipOptions {
    id?: string | number;
	showFirstErrorOnly?: boolean;
    placement?: Placement;
    zIndex?: number;
    tooltipClass?: string;
    shadow?: boolean;
    offset?: number;
    width?: string;
    maxWidth?: string;
    pointerEvents?: "auto" | "none"; // 'none' would mean that there is no reaction to clicks
}
