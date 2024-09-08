import { DateTime } from "luxon";
import { Copune } from "../../../database/Models/copune.model.js";
import { DescountType } from "../../utilites/enums.js";

/**
 * 
 * @param {*} coupenId 
 * @param {*} userId 
 * @returns {messaage:string,error:boolean,coupene:object}
 */
export const validateCoupen = async (coupenCode, userId) => {
    // get coupen by coupenCode

    const coupen = await Copune.findOne({ coupenCode });

    if (!coupen) {
        return {
            message: 'invalid coupen',
            error: true
        }
    }

    // check if coupen isEnabled

    if (!coupen.isEnabled || DateTime.now() > DateTime.fromJSDate(coupen.till)) {
        return {
            message: 'coupen is disabled',
            error: true
        }
    }

    // ckeck coupen is not start yet

    if (DateTime.now() < DateTime.fromJSDate(coupen.from)) {
        return {
            message: `coupen is not start yet, will start with ${coupen.from}`,
            error: true
        }
    }

    // check if user already used this coupen
    const isUserNotEligible = coupen.users.some(u => u.userId.toString() !== userId.toString() || (u.userId.toString() === userId.toString() && u.maxCount <= u.useageCount));

    if (isUserNotEligible) {
        return {
            message: 'user is not eligible to use this coupen',
            error: true
        }
    }

    return {

        error: false,
        coupen
    }

}


export const applayCoupen = (subTotal, coupen) => {
    let total = subTotal
    const { coupenAmount: discountAmount, coupenType: discountType } = coupen;
    if (discountAmount && discountType) {
        if (discountType == DescountType.PERCENTAGE) {
            total = subTotal - (subTotal * discountAmount / 100)
        } else if (discountType === DescountType.Amount) {
            if (discountAmount > subTotal) {
                return total
            }
            total = subTotal - discountAmount
        }
    }

    return total;
}