import { Chance } from 'chance';
import path from 'path';
import cwd from 'cwd';

const absChanceMixinPath = path.resolve(path.join(cwd(), 'test'), 'chance.mixin.js');
const chanceMixin = require(absChanceMixinPath);
new Chance().mixin(chanceMixin);  // yes, this is weird. see https://github.com/chancejs/chancejs/issues/204

module.exports = { Chance }
