import { NextResponse } from "next/server";
import { deleteOrder, updateOrderStatus } from "../../../lib/orders";

export async function PATCH(request, { params }) {
  const body = await request.json();
  const order = await updateOrderStatus(params.id, body.status);

  if (!order) {
    return NextResponse.json({ error: "Order not found or invalid status." }, { status: 404 });
  }

  return NextResponse.json({ order });
}

export async function DELETE(_request, { params }) {
  const deleted = await deleteOrder(params.id);

  if (!deleted) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
