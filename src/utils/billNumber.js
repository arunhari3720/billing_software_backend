export function makeBillNumber(prefix="BILL"){return `${prefix}-${Date.now().toString(36).toUpperCase()}`;}
