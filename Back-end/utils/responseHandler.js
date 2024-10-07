export const handleResponse = (res, data, successMessage, errorMessage) => {
    if (data && data.success !== false) {
      res.status(200).json({ success: true, message: successMessage, data });
    } else {
      res.status(404).json({ success: false, message: errorMessage, data });
    }
  };