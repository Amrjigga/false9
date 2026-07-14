import { NextResponse } from "next/server";
import { createOrder, readOrders } from "../../lib/orders";
import { products, sizes } from "../../products";
import { getShippingFee, getShippingZone } from "../../shipping";

const egyptGovernorates = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Dakahlia",
  "Red Sea",
  "Beheira",
  "Fayoum",
  "Gharbia",
  "Ismailia",
  "Menofia",
  "Minya",
  "Qaliubiya",
  "New Valley",
  "Suez",
  "Aswan",
  "Assiut",
  "Beni Suef",
  "Port Said",
  "Damietta",
  "Sharkia",
  "South Sinai",
  "Kafr El Sheikh",
  "Matrouh",
  "Luxor",
  "Qena",
  "North Sinai",
  "Sohag"
];

function toEgyptPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  const localDigits = digits.startsWith("20") ? digits.slice(2) : digits;

  return localDigits.length === 10 ? `+20${localDigits}` : null;
}

function toInternationalPhone(countryCode, value) {
  const code = String(countryCode || "").replace(/[^\d+]/g, "");
  const digits = String(value || "").replace(/\D/g, "");

  if (!/^\+\d{1,4}$/.test(code) || digits.length < 6 || digits.length > 15) {
    return null;
  }

  return `${code}${digits}`;
}

export async function GET() {
  const orders = await readOrders();
  return NextResponse.json({ orders });
}

export async function POST(request) {
  const body = await request.json();
  const cartItems = Array.isArray(body.items) ? body.items : null;
  const product = products.find((item) => item.id === body.productId);
  const size = sizes.includes(body.size) ? body.size : null;
  const normalizedItems = cartItems
    ? cartItems.map((item) => {
      const cartProduct = products.find((productItem) => productItem.id === item.productId);
      const itemSize = sizes.includes(item.size) ? item.size : null;
      const quantity = Math.min(5, Math.max(1, Number(item.quantity || 1)));

      if (!cartProduct || !itemSize) {
        return null;
      }

      return {
        productId: cartProduct.id,
        productName: cartProduct.name,
        size: itemSize,
        quantity,
        unitPrice: cartProduct.price,
        total: cartProduct.price * quantity
      };
    }).filter(Boolean)
    : null;

  const required = [
    body.customerName,
    body.phone,
    body.governorate,
    body.city,
    body.address,
    cartItems ? normalizedItems?.length : product,
    cartItems ? true : size
  ];

  if (required.some((value) => !value)) {
    return NextResponse.json({ error: "Complete order details." }, { status: 400 });
  }

  if (!egyptGovernorates.includes(body.governorate)) {
    return NextResponse.json({ error: "Egypt only." }, { status: 400 });
  }

  const phone = toEgyptPhone(body.phone);
  const whatsapp = body.whatsapp
    ? toInternationalPhone(body.whatsappCountryCode || "+20", body.whatsapp)
    : phone;

  if (!phone || !whatsapp) {
    return NextResponse.json({ error: "Phone must be 10 Egypt digits. WhatsApp must match its country code." }, { status: 400 });
  }

  const quantity = Math.min(5, Math.max(1, Number(body.quantity || 1)));
  const items = normalizedItems || [{
    productId: product.id,
    productName: product.name,
    size,
    quantity,
    unitPrice: product.price,
    total: product.price * quantity
  }];
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const shippingFee = getShippingFee(body.governorate);
  const total = subtotal + shippingFee;

  const order = await createOrder({
    customerName: body.customerName.trim(),
    phone,
    whatsapp,
    productId: items[0].productId,
    productName: items.length === 1 ? items[0].productName : `${items.length} items`,
    size: items.length === 1 ? items[0].size : "Mixed",
    quantity: items.reduce((sum, item) => sum + item.quantity, 0),
    unitPrice: items.length === 1 ? items[0].unitPrice : subtotal,
    subtotal,
    shippingMethod: "Fast shipping",
    shippingFee,
    shippingZone: getShippingZone(shippingFee),
    total,
    items,
    governorate: body.governorate,
    city: body.city.trim(),
    address: body.address.trim(),
    notes: (body.notes || "").trim()
  });

  return NextResponse.json({ order }, { status: 201 });
}
