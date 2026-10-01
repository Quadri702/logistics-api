import crypto from "crypto";

const generateTrackingNumber = (): string => {
  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `LGX-${randomPart}`;
};

export default generateTrackingNumber;
