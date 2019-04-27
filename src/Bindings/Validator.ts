/**
 * @relayapp/base-provider
 *
 * (c) Harminder Virk <harminder.virk@relay.in>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { utils } from 'indicative'
import { parsePhoneNumberFromString } from 'libphonenumber-js/mobile'

/**
 * The phone rule ensures that a number is a valid Indian
 * phone number
 */
export const phone = {
  async: false,
  validate (data, field, _args, _type, root, config) {
    const fieldValue = data[field]

    if (utils.skippable(fieldValue, field, config)) {
      return true
    }

    /**
     * Ensure the number is valid
     */
    const phoneNumber = parsePhoneNumberFromString(fieldValue, 'IN')
    if (!phoneNumber || !phoneNumber.isValid()) {
      return false
    }

    /**
     * Patch the value by mutating it
     */
    utils.patchValue(data, field, phoneNumber.nationalNumber, root)
    return true
  },
}
