export enum UploadWorkflowStatus {
    PROCESSING = "PROCESSING",
    ORIGINAL_DATA_INVALID = "ORIGINAL_DATA_INVALID",
    DUPLICATE_CHECK_ERROR = "DUPLICATE_CHECK_ERROR",
    ALREADY_EXISTS = "ALREADY_EXISTS",
    UPLOAD_ERROR = "UPLOAD_ERROR",
    SUCCESS = "SUCCESS",
    OTHER = "OTHER",
}

export type UploadWorkflow<T> = {
    data: T;
    orig: string | T;   // Union type allowing either a csv string or parsed JSON object
    status: UploadWorkflowStatus;
    logs: string[];
};

export type UploadWorkflowResults<T> = {
    [Property in keyof UploadWorkflowStatus]: T[];
};

export type RegionUploadWorkflow = UploadWorkflow<Region>
export type RegionUploadWorkflowResults = UploadWorkflowResults<Region>;
// export type SubregionUploadWorkflow = UploadWorkflow<Subregion>
// export type SubregionUploadWorkflowResults = UploadWorkflowResults<Subregion>;


export type Region = {
    region?: string;
};

export type Subregion = {
    subregion?: string;
};

export type NeedAssessment = {
    id?: string;
    survey?: {
        id?: string;
        year?: string;
        quarter?: string;
        url?: string;
        format?: string;
    };
    place?: {
        region?: string;
        subregion?: string;
    };
    product?: {
        category?: string;
        item?: string;
        ageGender?: string;
        sizeStyle?: string;
        unit?: string;
    };
    need?: string;
};