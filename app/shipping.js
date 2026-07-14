export const shippingFees = {
  Cairo: 80,
  Giza: 80,
  Alexandria: 90,
  Qaliubiya: 90,
  Sharkia: 90,
  Menofia: 90,
  Monufia: 90,
  Beheira: 90,
  Dakahlia: 90,
  Gharbia: 90,
  "Kafr El Sheikh": 90,
  Damietta: 90,
  Suez: 90,
  Ismailia: 90,
  "Port Said": 90,
  Fayoum: 95,
  "Beni Suef": 95,
  Minya: 125,
  Assiut: 125,
  Sohag: 125,
  Qena: 125,
  Luxor: 185,
  Aswan: 185,
  "New Valley": 185,
  Matrouh: 185,
  "Red Sea": 185,
  "South Sinai": 185,
  "North Sinai": 185
};

export function getShippingFee(governorate) {
  return shippingFees[governorate] || 0;
}

export function getShippingZone(shippingFee) {
  if (shippingFee === 80) return "Cairo/Giza";
  if (shippingFee === 90) return "Near governorate";
  if (shippingFee === 95) return "Extended governorate";
  if (shippingFee === 125) return "Upper Egypt";
  if (shippingFee === 185) return "Far governorate";
  return "Unselected";
}
