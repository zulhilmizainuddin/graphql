export const generateExecutableSchemasMap = (directory, modules) => modules.reduce((obj, module) => {
  const path = `${directory}/${module}`;

  const { executable } = require(`${path}/executable`);

  obj[module] = executable;

  return obj;
}, {});
