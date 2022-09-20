const service = require("./servises");

const getall = async (req, res) => {
  try {
    const book = await service.get(req);
    res.json({ data: book, success: "Succesfull", message: "Succesfull" });
  } catch (error) {
    res.json({ data: error });
  }
};
const getById = async (req, res) => {
  try {
    const book = await service.getBy(req);
    res
      .status(200)
      .json({ data: book, success: "Succesfull", message: "Succesfull" });
  } catch (error) {
    res.json({ data: error });
  }
};

const createbook = async (req, res) => {
  try {
    const book = await service.create(req);
    res
      .status(200)
      .json({ data: book, success: "Succesfull", message: "Succesfull" });
  } catch (error) {
    res.json({ data: error });
  }
};

const update = async (req, res) => {
  try {
    const book = await service.update(req);
    res.json({ data: book, success: "Succesfull", message: "Succesfull" });
  } catch (error) {
    res.json({ data: error });
  }
};

const deletes = async (req, res) => {
  try {
    const book = await service.deletes(req);
    res
      .status(200)
      .json({ data: book, success: "Succesfull", message: "Succesfull" });
  } catch (error) {
    res.json({ data: error });
  }
};
module.exports = {
  getall,
  createbook,
  update,
  deletes,
  getById,
};
