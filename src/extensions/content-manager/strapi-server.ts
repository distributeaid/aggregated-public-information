import { processContentType } from "../../functions/content-types";

export default (plugin) => {
  const originalCreate = plugin.controllers["collection-types"].create;
  plugin.controllers["collection-types"].create = (ctx, next) => {
    ctx.request.body = processContentType(ctx.request.path, ctx.request.body);
    return originalCreate(ctx, next);
  };

  const originalUpdate = plugin.controllers["collection-types"].update;
  plugin.controllers["collection-types"].update = (ctx, next) => {
    ctx.request.body = processContentType(ctx.request.path, ctx.request.body);
    return originalUpdate(ctx, next);
  };

  return plugin;
};
