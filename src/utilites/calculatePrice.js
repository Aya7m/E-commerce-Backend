import { DescountType } from "./enums.js"

export const calculateProductPrice = (price, discount) => {
    let appliedPrice = price
    if (discount.type === DescountType.PERCENTAGE) {
        appliedPrice = price - (price * discount.amount) / 100
    }
    else if (discount.type === DescountType.FIXED) {
        appliedPrice = price - discount.amount
    }

    return appliedPrice
}