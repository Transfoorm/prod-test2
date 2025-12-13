/**
 * VRP ESLint Plugin - Virgin Repo Protocol Enforcement
 *
 * Rules:
 *   - no-foreign-auth: Blocks foreign authentication systems outside auth boundary
 *
 * Ref: VRP-PROTOCOL.md, TTT-99-WAYS-CLERK-CAN-INFECT.md
 */

const noForeignAuth = require('./no-foreign-auth.js');

module.exports = {
  rules: {
    'no-foreign-auth': noForeignAuth.rules['no-foreign-auth'],
  },
};
