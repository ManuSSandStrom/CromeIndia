import mongoose from 'mongoose';
const analyticsEventSchema=new mongoose.Schema({event:{type:String,required:true,index:true,enum:['whatsapp_click','assistant_open','quote_click','call_click']},page:{type:String,default:'',maxlength:300},target:{type:String,default:'',maxlength:140},metadata:{type:mongoose.Schema.Types.Mixed,default:{}}},{timestamps:true});
analyticsEventSchema.index({createdAt:-1,event:1});
export default mongoose.model('AnalyticsEvent',analyticsEventSchema);
