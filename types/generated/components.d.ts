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
    End: Attribute.DateTime & Attribute.Required;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'geo.location': GeoLocation;
      'team.role': TeamRole;
      'time.duration': TimeDuration;
    }
  }
}
