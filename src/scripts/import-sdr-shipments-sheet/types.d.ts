export enum UploadWorkflowStatus {
  PROCESSING = "PROCESSING",
  ORIGINAL_DATA_INVALID = "ORIGINAL_DATA_INVALID",
  DUPLICATE_CHECK_ERROR = "DUPLICATE_CHECK_ERROR",
  ALREADY_EXISTS = "ALREADY_EXISTS",
  UPLOAD_ERROR = "UPLOAD_ERROR",
  SUCCESS = "SUCCESS",
  OTHER = "OTHER",
}

export type UploadWorkflow<T, TCsv> = {
  data: T;
  orig: TCsv;
  status: UploadWorkflowStatus;
  logs: string[];
};

export type UploadWorkflowResults<T> = {
  [Property in keyof UploadWorkflowStatus]: T[];
};

export type CountryUploadWorkflow = UploadWorkflow<Country, string>;
export type CountryUploadWorkflowResults = UploadWorkflowResults<Country>;
export type ShipmentUploadWorkflow = UploadWorkflow<Shipment, ShipmentCsv>;
export type ShipmentUploadWorkflowResults = UploadWorkflowResults<Shipment>;

export type Country = {
  documentId?: string;
  name?: string;
  code?: string;
};

export type CountryCodeToId = {
  [key: string]: string;
};

export type Shipment = {
  number?: string;
  sendingCountry?: string;
  receivingCountry?: string;
  carrierId?: string;
  exporter?: string;
  importer?: string;
  type?: string;
  project?: string;
  carbonOffsetPaid?: boolean;
  co2TonsGenerated?: number;
  carbonOffsetCost?: number;

  daRoles?: {
    needsAssessment: boolean;
    sourcingInKindDonations: boolean;
    sourcingProcurement: boolean;
    sourcingCommunityCollection: boolean;
    aidMatching: boolean;
    firstMileTransportation: boolean;
    firstMileStorageCommunity: boolean;
    firstMileStorageCommercial: boolean;
    mainLegTransportation: boolean;
    customsTransit: boolean;
    customsExport: boolean;
    customsImport: boolean;
    lastMileTransportation: boolean;
    lastMileStorageCommunity: boolean;
    lastMileStorageCommercial: boolean;
  };
};

export type ShipmentCsv = {
  number: string;
  sendingCountry: string;
  receivingCountry: string;
  carrierId: string;
  exporter: string;
  importer: string;
  type: string;
  project: string;
  carbonOffsetPaid: string;
  co2TonsGenerated: string;
  carbonOffsetCost: string;

  daRoles: {
    needsAssessment: string;
    sourcingInKindDonations: string;
    sourcingProcurement: string;
    sourcingCommunityCollection: string;
    aidMatching: string;
    firstMileTransportation: string;
    firstMileStorageCommunity: string;
    firstMileStorageCommercial: string;
    mainLegTransportation: string;
    customsTransit: string;
    customsExport: string;
    customsImport: string;
    lastMileTransportation: string;
    lastMileStorageCommunity: string;
    lastMileStorageCommercial: string;
  };
};
