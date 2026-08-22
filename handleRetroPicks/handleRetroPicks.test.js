const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, 'handleRetroPicks.js'), 'utf8');

assert.match(source, /const\s+DRAFT_LENGTH\s*=\s*223;/);
assert.doesNotMatch(source, /const\s+DRAFT_LENGTH\s*=\s*PICKS_PER_ROUND\s*\*\s*DRAFT_ROUNDS;/);

console.log('handleRetroPicks draft length configuration is valid.');
