export const validatePackage = (data) => {
    if (!data.label) throw new Error("Label required");
  
    if (!Array.isArray(data.options) || data.options.length === 0) {
      throw new Error("Options required");
    }
  
    data.options.forEach((opt) => {
      if (!opt.label || !opt.value) {
        throw new Error("Invalid option");
      }
    });
  };