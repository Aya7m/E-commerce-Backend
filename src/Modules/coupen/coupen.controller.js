


// @api {post} /api/v1/coupen create coupen


import { Copune, CoupenCheckLog } from "../../../database/Models/copune.model.js";
import { User } from "../../../database/Models/user.model.js";
import { AppError } from "../../utilites/classError.js";

export const createCoupen = async (req, res, next) => {
    const { coupenCode, coupenAmount, coupenType, from, till, users } = req.body;
    const userId = req.authaUser._id;




    // coupen code check

    const isCoupenCodeExist = await Copune.findOne({ coupenCode });
    if (isCoupenCodeExist) {
        return next(new AppError('coupen code already exist', 400));
    }

    const userIds = users.map(u => u.userId);
    const validUser = await User.find({ _id: { $in: userIds } });

    if (validUser.length !== userIds.length) {
        return next(new AppError('user not found', 404));
    }

    const newCopen = new Copune({ coupenCode, coupenAmount, coupenType, from, till, users, createdBy: req.authaUser._id });
    await newCopen.save();
    res.status(201).json({
        status: 'success',
        data: {
            newCopen
        }
    })
}



// get all coupen

export const getAllCoupen = async (req, res, next) => {
    const { isEnabled } = req.query;
    const filter = {};
    if (isEnabled) {

        filter.isEnabled = isEnabled === 'true' ? true : false;
    }
    const copunes = await Copune.find(filter);
    res.status(200).json({
        status: 'success',
        data: {
            copunes
        }
    })
}


// get coupen by id

export const getCoupenById = async (req, res, next) => {
    const { coupenId } = req.params;
    const coupen = await Copune.findById(coupenId);
    if (!coupen) {
        return next(new AppError('coupen not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            coupen
        }
    })
}



// update coupen by coupenId

export const updateCoupen = async (req, res, next) => {
    const { coupenId } = req.params;
    const userId = req.authaUser._id;

    const { coupenCode, coupenAmount, coupenType, from, till, users } = req.body;


    const coupen = await Copune.findById(coupenId);
    if (!coupen) {
        return next(new AppError('coupen not found', 404));
    }
    const logUpdateObject = {coupenId, updatedBy: userId, changes: {} };

    if (coupenCode) {
        const isCoupenCodeExist = await Copune.findOne({ coupenCode });
        if (isCoupenCodeExist) {
            return next(new AppError('coupen code already exist', 400));
        }
        coupen.coupenCode = coupenCode;
        logUpdateObject.changes.coupenCode = coupenCode;
    }

    if (from) {
        coupen.from = from;
        logUpdateObject.changes.from = from;
    }

    if (till) {
        coupen.till = till;
        logUpdateObject.changes.till = till;
    }

    if (coupenType) {
        coupen.coupenType = coupenType;
        logUpdateObject.changes.coupenType = coupenType;
    }
    if (coupenAmount) {
        coupen.coupenAmount = coupenAmount;
        logUpdateObject.changes.coupenAmount = coupenAmount;
    }

    if (users) {
        const userIds = users.map(u => u.userId);
        const validUser = await User.find({ _id: { $in: userIds } });
        if (validUser.length !== userIds.length) {
            return next(new AppError('user not found', 404));
        }
        coupen.users = users;
        logUpdateObject.changes.users = users;

    }

    await coupen.save();
    const log = await new CoupenCheckLog(logUpdateObject).save();

    res.status(200).json({
        status: 'success',
        data: {
            coupen,
            log,

        }
    })
}



// disable or enable coupen

export const disableOrEnableCoupen = async (req, res, next) => {
    const { coupenId } = req.params;
    const userId = req.authaUser._id;
    const { enable } = req.body;
    const coupen = await Copune.findById(coupenId);

    if (!coupen) {
        return next(new AppError('coupen not found', 404));
    }


    const logUpdateObject = {coupenId, updatedBy: userId, changes: {} };

    if(enable===true){
        coupen.isEnabled = true;
        logUpdateObject.changes.isEnabled = true;
    }

    if(enable===false){
        coupen.isEnabled = false;
        logUpdateObject.changes.isEnabled = false;
    }

    await coupen.save();

    const log = await new CoupenCheckLog(logUpdateObject).save();
    res.status(200).json({
        status: 'success',
        data: {
            coupen,
            log
        }
    })
}