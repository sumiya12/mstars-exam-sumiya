type PackageOption = {
    label?: string;
    value?: string;
};

type PackageData = {
    label?: string;
    options?: PackageOption[];
};

export const validatePackage = (data: PackageData) => {
    if (!data.label) throw new Error("Label required");
  
    if (!Array.isArray(data.options) || data.options.length === 0) {
      throw new Error("Options required");
    }
  
    data.options.forEach((opt: PackageOption) => {
      if (!opt.label || !opt.value) {
        throw new Error("Invalid option");
      }
    });
  };
