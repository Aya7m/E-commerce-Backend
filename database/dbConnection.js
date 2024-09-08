import { connect } from "mongoose";

export const databaseConnected = connect('mongodb://127.0.0.1:27017/E-commerceBack').then(() => {
    console.log('database connected successfully .');

}).catch((err) => {
    console.log('database error connected .', err);

})