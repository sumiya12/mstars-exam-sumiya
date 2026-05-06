import PartyOrder from "../models/PartyOrder.js";

export const createPartyOrder = async (req, res) => {
  try {
    const order = await PartyOrder.create(req.body);
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPartyOrders = async (req, res) => {
  try {
    const orders = await PartyOrder.find().sort({ eventDate: 1, eventTime: 1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePartyOrder = async (req, res) => {
  try {
    const allowedFields = [
      "orderDate",
      "note",
      "extra",
      "customerName",
      "eventType",
      "decoration",
      "childGender",
      "eventDate",
      "eventTime",
      "packageName",
      "location",
      "peopleCount",
      "prePay",
      "studioBooked",
      "studioDateTime",
      "nameToPrint",
      "moneyNote",
      "createdBy",
    ];

    const updateData: Record<string, any> = {};

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updateData[field] = req.body[field];
      }
    });

    const order = await PartyOrder.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Party order not found" });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePartyOrder = async (req, res) => {
  try {
    await PartyOrder.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
