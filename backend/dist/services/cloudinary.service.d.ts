export declare const isCloudinaryConfigured: () => boolean;
export declare const uploadToCloudinary: (filePath: string, folder?: string, resourceType?: "video" | "auto") => Promise<{
    url: string;
    publicId: string;
}>;
export declare const deleteFromCloudinary: (publicId: string) => Promise<void>;
export declare const getCloudinaryUrl: (publicId: string) => string;
//# sourceMappingURL=cloudinary.service.d.ts.map