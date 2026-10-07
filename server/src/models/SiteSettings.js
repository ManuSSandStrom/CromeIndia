import mongoose from 'mongoose';
const settingsSchema=new mongoose.Schema({key:{type:String,default:'main',unique:true},data:{type:mongoose.Schema.Types.Mixed,default:{}}},{timestamps:true});export default mongoose.model('SiteSettings',settingsSchema);
