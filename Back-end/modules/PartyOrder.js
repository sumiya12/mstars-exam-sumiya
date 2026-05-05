import mongoose from "mongoose";

const partyOrderSchema = new mongoose.Schema(
  {
    orderDate: { type: String },          // Захиалга өгсөн огноо
    note: { type: String },               // тайлбар
    extra: { type: String },              // нэмэлт
    customerName: { type: String, required: true }, // Нэр хаяг

    eventType: { type: String },          // төрөл: 1 нас, 2 нас, сэвлэг
    decoration: { type: String },         // чимэглэл
    childGender: { type: String },        // хүү/охин

    eventDate: { type: String, required: true }, // Хэзээ болох
    eventTime: { type: String, required: true }, // Хэдэн цагт

    packageName: { type: String },        // Сонгосон багц
    location: { type: String },           // Хаана
    peopleCount: { type: String },        // Хэдэн хүнтэй

    prePay: { type: Number, default: 0 },  // Урьдчилгаа хийсэн дүн

    studioBooked: { type: Boolean, default: false },
    studioDateTime: { type: String },

    nameToPrint: { type: String },        // Нэр бичлүүлэх
    moneyNote: { type: String },          // Мөнгө

    createdBy: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("PartyOrder", partyOrderSchema);