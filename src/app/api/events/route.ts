import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import { startOfTodayIST } from "../../../lib/eventDates";

interface EventData {
  _id: string;
  title: string;
  description?: string;
  date: string;
  venue?: string;
  speaker?: string;
}

interface RawEvent {
  _id?: { toString(): string };
  title?: string;
  description?: string;
  date?: Date;
  venue?: string;
  speaker?: string;
}

function parseDDMMYYYYToDate(dateStr: string): Date | null {
  const [day, month, year] = dateStr.split("/").map(Number);
  if (!day || !month || !year || day < 1 || day > 31 || month < 1 || month > 12 || year < 1000) {
    return null;
  }
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDateDDMMYYYY(date: Date): string {
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

export async function GET() {
  // today's date in IST, so an event stays upcoming for its whole day
  const currentDate = startOfTodayIST();

  try {
    const { client } = await connectToDatabase();
    const db = client.db();
    const events = db.collection<RawEvent>("events");

    const pastEvents = await events.find({ date: { $lt: currentDate } }).sort({ date: 1 }).toArray();
    const upcomingEvents = await events.find({ date: { $gte: currentDate } }).sort({ date: 1 }).toArray();

    const serialize = (arr: RawEvent[]): EventData[] =>
      arr
        .filter((item): item is Required<RawEvent> => !!item.title && !!item.date)
        .map((item) => ({
          _id: item._id?.toString?.() ?? "",
          title: item.title,
          description: item.description ?? "",
          date: formatDateDDMMYYYY(new Date(item.date)),
          venue: item.venue ?? "",
          speaker: item.speaker ?? "",
        }));

    return NextResponse.json({
      pastEvents: serialize(pastEvents),
      upcomingEvents: serialize(upcomingEvents),
      currentDate: formatDateDDMMYYYY(currentDate),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { client } = await connectToDatabase();
    const db = client.db();
    const events = db.collection("events");

    const body = (await request.json()) as {
      title?: string;
      description?: string;
      date?: string;
      venue?: string;
      speaker?: string;
    };

    if (!body.title || !body.date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const eventDate = parseDDMMYYYYToDate(body.date);
    if (!eventDate) {
      return NextResponse.json(
        { error: "Invalid date format, expected dd/mm/yyyy" },
        { status: 400 }
      );
    }

    const existingEvent = await events.findOne({
      title: body.title,
      date: { $gte: startOfTodayIST() },
    });

    if (existingEvent) {
      return NextResponse.json(
        { error: "An upcoming event with this title already exists" },
        { status: 400 }
      );
    }

    const event = {
      title: body.title,
      description: body.description || "",
      date: eventDate,
      venue: body.venue || "",
      speaker: body.speaker || null,
    };

    const result = await events.insertOne(event);

    return NextResponse.json({
      message: "Event created successfully",
      eventId: result.insertedId.toString(),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
