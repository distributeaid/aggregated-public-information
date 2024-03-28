/**
 * item controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::product.item', ({ strapi }) => ({
    async find(ctx) {
        const result = await super.find(ctx);
        strapi.log.info(`result of find: ${JSON.stringify(result)}`);
        return result;
    },

    async findOne(ctx) {
        const result = await super.findOne(ctx);
        strapi.log.info(`result of findOne: ${JSON.stringify(result)}`);
        return result;
    },

    async create(ctx) {
        const result = await super.create(ctx);
        strapi.log.info(`result of create: ${JSON.stringify(result)}`);
        return result;
    },

    async update(ctx) {
        const result = await super.update(ctx);
        strapi.log.info(`result of update: ${JSON.stringify(result)}`);
        return result;
    }
}));
