import type { Schema, Struct } from "@strapi/strapi";

export interface GeoLocation extends Struct.ComponentSchema {
  collectionName: "components_geo_locations";
  info: {
    displayName: "Location";
    icon: "pinMap";
  };
  attributes: {
    country: Schema.Attribute.Relation<"oneToOne", "api::geo.country">;
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProductNeedsMet extends Struct.ComponentSchema {
  collectionName: "components_product_needs_mets";
  info: {
    displayName: "Needs Met";
  };
  attributes: {
    items: Schema.Attribute.Integer;
    monthlyNeedsMetPerItem: Schema.Attribute.Decimal;
    months: Schema.Attribute.Integer;
    notes: Schema.Attribute.Text;
    people: Schema.Attribute.Integer;
    type: Schema.Attribute.Enumeration<["DA", "SPHERE"]>;
  };
}

export interface ProductSecondHand extends Struct.ComponentSchema {
  collectionName: "components_product_second_hands";
  info: {
    displayName: "Second Hand";
  };
  attributes: {
    canBeUsed: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    priceAdjustment: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<100>;
  };
}

export interface ProductValue extends Struct.ComponentSchema {
  collectionName: "components_product_values";
  info: {
    displayName: "Value";
  };
  attributes: {
    countPerPackage: Schema.Attribute.Integer;
    logDate: Schema.Attribute.Date & Schema.Attribute.Required;
    notes: Schema.Attribute.Text;
    packagePrice: Schema.Attribute.Decimal;
    packagePriceUnit: Schema.Attribute.Enumeration<["USD"]> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<"USD">;
    pricePerItemUSD: Schema.Attribute.Decimal;
    source: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProductVolume extends Struct.ComponentSchema {
  collectionName: "components_product_volumes";
  info: {
    description: "";
    displayName: "Volume";
  };
  attributes: {
    countPerCBM: Schema.Attribute.Decimal;
    countPerPackage: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    itemVolumeCBCM: Schema.Attribute.Decimal;
    logDate: Schema.Attribute.Date & Schema.Attribute.Required;
    notes: Schema.Attribute.Text;
    packageVolume: Schema.Attribute.Decimal & Schema.Attribute.Required;
    packageVolumeUnit: Schema.Attribute.Enumeration<
      ["cubic in", "cubic cm", "cubic ft", "cubic m"]
    > &
      Schema.Attribute.Required;
    source: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProductWeight extends Struct.ComponentSchema {
  collectionName: "components_product_weights";
  info: {
    displayName: "Weight";
  };
  attributes: {
    countPerKg: Schema.Attribute.Decimal;
    countPerPackage: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    itemWeightKg: Schema.Attribute.Decimal;
    logDate: Schema.Attribute.Date & Schema.Attribute.Required;
    notes: Schema.Attribute.Text;
    packageWeight: Schema.Attribute.Decimal & Schema.Attribute.Required;
    packageWeightUnit: Schema.Attribute.Enumeration<["lb", "oz", "g", "kg"]> &
      Schema.Attribute.Required;
    source: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ReportingShipmentRoles extends Struct.ComponentSchema {
  collectionName: "components_reporting_shipment_roles";
  info: {
    displayName: "Shipment Roles";
    icon: "check";
  };
  attributes: {
    aidMatching: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    customsExport: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    customsImport: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    customsTransit: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    firstMileStorageCommercial: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    firstMileStorageCommunity: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    firstMileTransportation: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    lastMileStorageCommercial: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    lastMileStorageCommunity: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    lastMileTransportation: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    mainLegTransportation: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    needsAssessment: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    sourcingCommunityCollection: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    sourcingInKindDonations: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    sourcingProcurement: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
  };
}

export interface ResponseCallToAction extends Struct.ComponentSchema {
  collectionName: "components_response_call_to_actions";
  info: {
    displayName: "Call To Action";
  };
  attributes: {
    buttonLink: Schema.Attribute.String;
    buttonText: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    imageLink: Schema.Attribute.String;
    title: Schema.Attribute.Enumeration<
      [
        "give money",
        "donate supplies",
        "ship aid with us",
        "join our network",
        "frontline groups",
      ]
    > &
      Schema.Attribute.DefaultTo<"give money">;
  };
}

export interface TeamRole extends Struct.ComponentSchema {
  collectionName: "components_team_roles";
  info: {
    description: "";
    displayName: "Role";
    icon: "handHeart";
  };
  attributes: {
    associatedCountry: Schema.Attribute.Relation<
      "oneToOne",
      "api::geo.country"
    >;
    Duration: Schema.Attribute.Component<"time.duration", false>;
    team: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        "plugin::multi-select.multi-select",
        ["admin", "operations", "stories", "tech", "design", "fundraising"]
      > &
      Schema.Attribute.DefaultTo<"[]">;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
    type: Schema.Attribute.Enumeration<
      ["board member", "director", "coordinator", "volunteer"]
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<"volunteer">;
  };
}

export interface TimeDuration extends Struct.ComponentSchema {
  collectionName: "components_time_durations";
  info: {
    displayName: "Duration";
    icon: "clock";
  };
  attributes: {
    end: Schema.Attribute.Date;
    start: Schema.Attribute.Date & Schema.Attribute.Required;
  };
}

declare module "@strapi/strapi" {
  export module Public {
    export interface ComponentSchemas {
      "geo.location": GeoLocation;
      "product.needs-met": ProductNeedsMet;
      "product.second-hand": ProductSecondHand;
      "product.value": ProductValue;
      "product.volume": ProductVolume;
      "product.weight": ProductWeight;
      "reporting.shipment-roles": ReportingShipmentRoles;
      "response.call-to-action": ResponseCallToAction;
      "team.role": TeamRole;
      "time.duration": TimeDuration;
    }
  }
}
