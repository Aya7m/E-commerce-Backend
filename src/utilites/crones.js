
import {scheduleJob} from 'node-schedule'
import { Copune } from '../../database/Models/copune.model.js';
import { DateTime } from 'luxon';

export const disableCopunescroneJob=async()=>{ 
    scheduleJob('0 59 23 * * *', async () => {
        console.log('running a task every second');
        const enabledCopune=await Copune.findOne({isEnabled:true})
        console.log(enabledCopune);
        if(enabledCopune.length){
            for(const coupen of enabledCopune){
                if(DateTime.now()>DateTime.fromJSDate(coupen.till)){
                    coupen.isEnabled=false;
                    await coupen.save();
                    
                }
            }
        }
    });
}
