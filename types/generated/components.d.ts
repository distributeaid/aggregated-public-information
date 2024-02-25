import type { Schema, Attribute } from '@strapi/strapi';

export interface GeoLocation extends Schema.Component {
  collectionName: 'components_geo_locations';
  info: {
    displayName: 'Location';
    icon: 'pinMap';
  };
  attributes: {
    Name: Attribute.String & Attribute.Required;
    Country: Attribute.Relation<'geo.location', 'oneToOne', 'api::geo.country'>;
  };
}

export interface ProductProductWeight extends Schema.Component {
  collectionName: 'components_product_product_weights';
  info: {
    displayName: 'Product Weight';
    description: '';
  };
  attributes: {
    packageWeight: Attribute.Decimal & Attribute.Required;
    packageWeightUnit: Attribute.JSON &
      Attribute.Required &
      Attribute.CustomField<'plugin::multi-select.multi-select', ['lb', 'oz']>;
    countPerPackage: Attribute.Integer & Attribute.Required;
    itemWeight: Attribute.Decimal;
    countPerKg: Attribute.Decimal;
    weightSource: Attribute.String & Attribute.Required;
    logDate: Attribute.Date & Attribute.Required;
    notes: Attribute.String;
  };
}

export interface ProductVolume extends Schema.Component {
  collectionName: 'components_product_volumes';
  info: {
    displayName: 'Volume';
  };
  attributes: {
    packageVolume: Attribute.Decimal;
    volumeUnit: Attribute.Enumeration<
      ['cubic in', 'cubic cm', 'cubic ft', 'cubic m']
    > &
      Attribute.DefaultTo<'cubic in'>;
    countPerPackage: Attribute.Integer & Attribute.DefaultTo<1>;
    itemVolumeCBCM: Attribute.BigInteger;
    countPerCBM: Attribute.BigInteger;
    volumeSource: Attribute.String;
    logDate: Attribute.Date;
    notes: Attribute.Text;
  };
}

export interface TeamRole extends Schema.Component {
  collectionName: 'components_team_roles';
  info: {
    displayName: 'Role';
    icon: 'handHeart';
    description: '';
  };
  attributes: {
    Title: Attribute.String & Attribute.Required;
    Type: Attribute.JSON &
      Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'Contributor',
          'Volunteer',
          'Maintainer',
          'Coordinator',
          'Director',
          'Board',
          'Advisory Board',
          'Founder'
        ]
      >;
    Location: Attribute.Component<'geo.location'>;
    Duration: Attribute.Component<'time.duration'>;
  };
}

export interface TimeDuration extends Schema.Component {
  collectionName: 'components_time_durations';
  info: {
    displayName: 'Duration';
    icon: 'clock';
  };
  attributes: {
    Start: Attribute.DateTime & Attribute.Required;
    End: Attribute.DateTime;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'geo.location': GeoLocation;
      'product.product-weight': ProductProductWeight;
      'product.volume': ProductVolume;
      'team.role': TeamRole;
      'time.duration': TimeDuration;
    }
  }
}
