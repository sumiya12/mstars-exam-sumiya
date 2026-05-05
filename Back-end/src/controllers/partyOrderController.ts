import PartyOrder from "../modules/PartyOrder.js";

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

export const deletePartyOrder = async (req, res) => {
  try {
    await PartyOrder.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};