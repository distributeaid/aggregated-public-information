import { errors } from "@strapi/utils";
export default {
  beforeCreate(event: any) {
    console.log("beforeCreate lifecycles");
    const { populate, data } = event.params;
    // console.log(JSON.stringify({ populate, data }, undefined, 2));
    // throw new errors.ApplicationError("oh no");
  },
};
