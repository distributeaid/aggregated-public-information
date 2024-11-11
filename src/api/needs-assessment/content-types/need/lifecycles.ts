import { errors } from "@strapi/utils";
export default {
  beforeCreate(event) {
    console.log("beforeCreate lifecycles");
    throw new errors.ApplicationError("oh no");
  },
};
