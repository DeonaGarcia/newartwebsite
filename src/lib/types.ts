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
}
