import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  try {
    const books = await prisma.book.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { Title: { contains: search } },
                  { Author: { contains: search } },
                  { ISBN: { contains: search } },
                ],
              }
            : {},
          category ? { CategoryID: category } : {},
        ],
      },
      include: {
        Category: true,
        Copies: true,
      },
    });

    const enriched = books.map(b => {
      const available = b.Copies.filter(c => c.Status === "Available").length;
      return { ...b, AvailableCopies: available };
    });

    return NextResponse.json(enriched);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Check for duplicate book with same Title AND Author
    const existing = await prisma.book.findFirst({
      where: {
        Title: data.title,
        Author: data.author,
      },
    });

    if (existing) {
      return NextResponse.json({ error: "A book with this title and author already exists" }, { status: 409 });
    }

    const book = await prisma.book.create({
      data: {
        Title: data.title,
        Author: data.author,
        ISBN: data.isbn,
        CategoryID: data.categoryId,
        PublicationYear: data.year ? parseInt(data.year) : null,
        Language: data.language,
        Edition: data.edition,
        Description: data.description,
        ShelfLocation: data.location,
        CoverImage: data.cover,
      }
    });

    // Create copies if specified
    if (data.copies && data.copies > 0) {
      const copiesData = Array.from({ length: data.copies }).map((_, i) => ({
        BookID: book.BookID,
        Barcode: `${book.ISBN || book.BookID.substring(0,8)}-COPY-${i+1}-${Date.now()}`,
        Status: "Available"
      }));
      await prisma.bookCopy.createMany({ data: copiesData });
    }

    return NextResponse.json(book, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
