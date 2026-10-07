import mongoose from 'mongoose';
const mediaSchema=new mongoose.Schema({title:{type:String,default:'',trim:true,maxlength:140},url:{type:String,required:true},filename:{type:String,required:true,unique:true},mimeType:{type:String,required:true},size:{type:Number,required:true},altText:{type:String,default:'',maxlength:300},category:{type:String,default:'Other',maxlength:80},displayOrder:{type:Number,default:0,index:true},published:{type:Boolean,default:false,index:true},deletedAt:Date},{timestamps:true});
mediaSchema.index({published:1,category:1,displayOrder:1});
export default mongoose.model('Media',mediaSchema);
