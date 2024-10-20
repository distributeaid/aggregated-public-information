import { processContentType } from "../../functions/content-types";

module.exports = (plugin) => {
  const originalCreate = plugin.controllers["collection-types"].create;
  plugin.controllers["collection-types"].create = (ctx) => {
    ctx.request.body = processContentType(ctx.request.path, ctx.request.body);
    return originalCreate(ctx);
  };

  const originalUpdate = plugin.controllers["collection-types"].update;
  plugin.controllers["collection-types"].update = (ctx) => {
    ctx.request.body = processContentType(ctx.request.path, ctx.request.body);
    return originalUpdate(ctx);
  };

  return plugin;
};
