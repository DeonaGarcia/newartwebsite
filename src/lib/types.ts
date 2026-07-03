export interface Artwork {
    id: string;
    title: string;
    imageUrl: string;
    width: number;
    height: number;
    type: "original" | "print";
    size?: string;
    medium?: string;
    price?: number;
    description?: string;
    status: "available" | "sold" | "reserved" | "unlisted";
    featured?: boolean;
    order: number;
    createdAt: string;
    updatedAt: string;
    canvas_width_in?: number;
    canvas_height_in?: number;
    canvas_depth_in?: number;
    weight_lbs?: number;
    shipping_carrier_override?: string;
    shipping_service_override?: string;
    shipping_override_notes?: string;
}

export interface ArtworkInput {
    title: string;
    type: "original" | "print";
    size?: string;
    medium?: string;
    price?: number;
    description?: string;
    status: "available" | "sold" | "reserved" | "unlisted";
    featured?: boolean;
    canvas_width_in?: number;
    canvas_height_in?: number;
    canvas_depth_in?: number;
    weight_lbs?: number;
    shipping_carrier_override?: string;
    shipping_service_override?: string;
    shipping_override_notes?: string;
}
