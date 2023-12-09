export function toTitlecase(str) {
  return str.split(' ').map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' ');
}

export function inCond(args) {
  if (args && Array.isArray(args)) {
    return { $in: args }
  }
  return args;
}


export function orCond(field, args) {
  if (!args) {
   return;
  }
  if(!Array.isArray(args)){
    args = [args];
  }
  const arr = [];
  for (const argsKey in args) {
    const obj = {};
    obj[field] = args[argsKey];
    arr.push(obj);
  }
  return { $or: arr };
}
