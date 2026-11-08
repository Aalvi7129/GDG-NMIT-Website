import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";

export async function POST(request: NextRequest) {
  const { client } = await connectToDatabase();
  const db = client.db(""); 
  const data = await request.json();
  const contact = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: data.message,
    date: new Date(),
  };

  try {
    await db.collection("contacts").insertOne(contact);
    return NextResponse.json({  success: true,
      message: "Contact message saved successfully."});
  } catch (error) {
    console.error("Error saving contact:", error);
    return NextResponse.json({ success: false, error: "Failed to save." }, { status: 500 });
  }
}
