import type { Struct, Schema } from "@strapi/strapi";

export interface TimeDuration extends Struct.ComponentSchema {
  collectionName: "components_time_durations";
  info: {
    displayName: "Duration";
    icon: "clock";
  };
  attributes: {
    Start: Schema.Attribute.DateTime & Schema.Attribute.Required;
    End: Schema.Attribute.DateTime;
  };
}

export interface TeamRole extends Struct.ComponentSchema {
  collectionName: "components_team_roles";
  info: {
    displayName: "Role";
    icon: "handHeart";
    description: "";
  };
  attributes: {
    Title: Schema.Attribute.String & Schema.Attribute.Required;
    Type: Schema.Attribute.String;
    Location: Schema.Attribute.Component<"geo.location", false>;
    Duration: Schema.Attribute.Component<"time.duration", false>;
  };
}

export interface GeoLocation extends Struct.ComponentSchema {
  collectionName: "components_geo_locations";
  info: {
    displayName: "Location";
    icon: "pinMap";
  };
  attributes: {
    Name: Schema.Attribute.String & Schema.Attribute.Required;
    Country: Schema.Attribute.Relation<"oneToOne", "api::geo.country">;
  };
}

export interface ProductWeight extends Struct.ComponentSchema {
  collectionName: "components_product_weights";
  info: {
    displayName: "Weight";
  };
  attributes: {
    packageWeight: Schema.Attribute.Decimal & Schema.Attribute.Required;
    packageWeightUnit: Schema.Attribute.Enumeration<["lb", "oz", "g", "kg"]> &
      Schema.Attribute.Required;
    countPerPackage: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    itemWeightKg: Schema.Attribute.Decimal;
    countPerKg: Schema.Attribute.Decimal;
    source: Schema.Attribute.String & Schema.Attribute.Required;
    logDate: Schema.Attribute.Date & Schema.Attribute.Required;
    notes: Schema.Attribute.Text;
  };
}

export interface ProductVolume extends Struct.ComponentSchema {
  collectionName: "components_product_volumes";
  info: {
    displayName: "Volume";
    description: "";
  };
  attributes: {
    packageVolume: Schema.Attribute.Decimal & Schema.Attribute.Required;
    packageVolumeUnit: Schema.Attribute.Enumeration<
      ["cubic in", "cubic cm", "cubic ft", "cubic m"]
    > &
      Schema.Attribute.Required;
    countPerPackage: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    itemVolumeCBCM: Schema.Attribute.Decimal;
    countPerCBM: Schema.Attribute.Decimal;
    source: Schema.Attribute.String & Schema.Attribute.Required;
    logDate: Schema.Attribute.Date & Schema.Attribute.Required;
    notes: Schema.Attribute.Text;
  };
}

export interface ProductValue extends Struct.ComponentSchema {
  collectionName: "components_product_values";
  info: {
    displayName: "Value";
  };
  attributes: {
    packagePrice: Schema.Attribute.Decimal;
    packagePriceUnit: Schema.Attribute.Enumeration<["USD"]> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<"USD">;
    countPerPackage: Schema.Attribute.Integer;
    pricePerItemUSD: Schema.Attribute.Decimal;
    source: Schema.Attribute.String & Schema.Attribute.Required;
    logDate: Schema.Attribute.Date & Schema.Attribute.Required;
    notes: Schema.Attribute.Text;
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
          min: 0;
          max: 100;
        },
        number
      > &
      Schema.Attribute.DefaultTo<100>;
  };
}

export interface ProductNeedsMet extends Struct.ComponentSchema {
  collectionName: "components_product_needs_mets";
  info: {
    displayName: "Needs Met";
  };
  attributes: {
    items: Schema.Attribute.Integer;
    people: Schema.Attribute.Integer;
    type: Schema.Attribute.Enumeration<["DA", "SPHERE"]>;
    months: Schema.Attribute.Integer;
    monthlyNeedsMetPerItem: Schema.Attribute.Decimal;
    notes: Schema.Attribute.Text;
  };
}

declare module "@strapi/strapi" {
  export module Public {
    export interface ComponentSchemas {
      "time.duration": TimeDuration;
      "team.role": TeamRole;
      "geo.location": GeoLocation;
      "product.weight": ProductWeight;
      "product.volume": ProductVolume;
      "product.value": ProductValue;
      "product.second-hand": ProductSecondHand;
      "product.needs-met": ProductNeedsMet;
    }
  }
}
